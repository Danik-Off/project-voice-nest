import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from './entities/friend.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getFriends(userId: number) {
    const friends = await this.friendRepository.find({
      where: [
        { userId, status: FriendStatus.ACCEPTED },
        { friendId: userId, status: FriendStatus.ACCEPTED },
      ],
      relations: ['user', 'friend'],
    });

    const uniqueFriends = new Map<number, any>();

    friends.forEach((friend) => {
      const friendUser = friend.userId === userId ? friend.friend : friend.user;
      if (friendUser && !uniqueFriends.has(friendUser.id)) {
        uniqueFriends.set(friendUser.id, {
          id: friendUser.id,
          username: friendUser.username,
          profilePicture: friendUser.profilePicture,
          status: friendUser.status,
          tag: friendUser.tag,
        });
      }
    });

    return Array.from(uniqueFriends.values());
  }

  async getFriendRequests(userId: number) {
    const incoming = await this.friendRepository.find({
      where: { friendId: userId, status: FriendStatus.PENDING },
      relations: ['user'],
    });

    const outgoing = await this.friendRepository.find({
      where: { userId, status: FriendStatus.PENDING },
      relations: ['friend'],
    });

    return {
      incoming: incoming.map((friend) => ({
        id: friend.id,
        user: {
          id: friend.user.id,
          username: friend.user.username,
          profilePicture: friend.user.profilePicture,
          tag: friend.user.tag,
        },
        createdAt: friend.createdAt,
      })),
      outgoing: outgoing.map((friend) => ({
        id: friend.id,
        user: {
          id: friend.friend.id,
          username: friend.friend.username,
          profilePicture: friend.friend.profilePicture,
          tag: friend.friend.tag,
        },
        createdAt: friend.createdAt,
      })),
    };
  }

  async sendFriendRequest(userId: number, sendFriendRequestDto: SendFriendRequestDto) {
    const { friendId } = sendFriendRequestDto;

    // Cannot add yourself
    if (userId === friendId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    const targetUser = await this.userRepository.findOne({ where: { id: friendId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user is blocked
    const isBlocked = await this.blockedUserRepository.findOne({
      where: { blockerId: friendId, blockedId: userId },
    });

    if (isBlocked) {
      throw new BadRequestException('User is blocked');
    }

    // Check if already friends
    const existingFriend = await this.friendRepository.findOne({
      where: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });

    if (existingFriend) {
      if (existingFriend.status === FriendStatus.ACCEPTED) {
        throw new ConflictException('Already friends');
      }
      throw new ConflictException('Friend request already sent');
    }

    const friend = this.friendRepository.create({
      userId,
      friendId,
      status: FriendStatus.PENDING,
    });

    await this.friendRepository.save(friend);

    return {
      message: 'Запрос в друзья отправлен.',
      request: {
        id: friend.id,
        userId: friend.userId,
        friendId: friend.friendId,
        status: friend.status,
      },
    };
  }

  async acceptFriendRequest(requestId: number, userId: number) {
    const friendRequest = await this.friendRepository.findOne({
      where: { id: requestId, friendId: userId },
    });

    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    friendRequest.status = FriendStatus.ACCEPTED;
    await this.friendRepository.save(friendRequest);

    return { message: 'Запрос в друзья принят.' };
  }

  async removeFriendOrRejectRequest(id: number, userId: number) {
    const friend = await this.friendRepository.findOne({
      where: { id },
    });

    if (!friend) {
      throw new NotFoundException('Friend request not found');
    }

    // Check if user is involved
    if (friend.userId !== userId && friend.friendId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    await this.friendRepository.remove(friend);

    return { message: 'Друг удален или запрос отклонен.' };
  }

  async blockUser(userId: number, targetUserId: number) {
    // Cannot block yourself
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already blocked
    const existingBlock = await this.blockedUserRepository.findOne({
      where: { blockerId: userId, blockedId: targetUserId },
    });

    if (existingBlock) {
      throw new ConflictException('User already blocked');
    }

    const blockedUser = this.blockedUserRepository.create({
      blockerId: userId,
      blockedId: targetUserId,
    });

    await this.blockedUserRepository.save(blockedUser);

    // Remove any existing friend relationship
    const existingFriend = await this.friendRepository.findOne({
      where: [
        { userId, friendId: targetUserId },
        { userId: targetUserId, friendId: userId },
      ],
    });

    if (existingFriend) {
      await this.friendRepository.remove(existingFriend);
    }

    return { message: 'Пользователь заблокирован.' };
  }

  async getBlockedUsers(userId: number) {
    const blockedUsers = await this.blockedUserRepository.find({
      where: { blockerId: userId },
      relations: ['blocked'],
    });

    return blockedUsers.map((blocked) => ({
      id: blocked.blocked.id,
      username: blocked.blocked.username,
      profilePicture: blocked.blocked.profilePicture,
      tag: blocked.blocked.tag,
    }));
  }
}
