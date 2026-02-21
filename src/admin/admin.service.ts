import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRoleEnum } from '../users/entities/user.entity';
import { Server } from '../servers/entities/server.entity';
import { Channel, ChannelType } from '../channels/entities/channel.entity';
import { Message } from '../messages/entities/message.entity';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { BlockServerDto } from './dto/block-server.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const blockedUsers = await this.userRepository.count({ where: { isActive: false } });

    const usersByRole = {
      [UserRoleEnum.USER]: await this.userRepository.count({ where: { role: UserRoleEnum.USER } }),
      [UserRoleEnum.MODERATOR]: await this.userRepository.count({ where: { role: UserRoleEnum.MODERATOR } }),
      [UserRoleEnum.ADMIN]: await this.userRepository.count({ where: { role: UserRoleEnum.ADMIN } }),
    };

    const totalServers = await this.serverRepository.count();
    const activeServers = await this.serverRepository.count({ where: { isBlocked: false } });
    const blockedServers = await this.serverRepository.count({ where: { isBlocked: true } });
    const serversWithChannels = await this.serverRepository
      .createQueryBuilder('server')
      .leftJoinAndSelect('server.channels', 'channels', 'server.id = channels.serverId')
      .where('channels.id IS NOT NULL')
      .getCount();

    const totalChannels = await this.channelRepository.count();
    const textChannels = await this.channelRepository.count({ where: { type: ChannelType.TEXT } });
    const voiceChannels = await this.channelRepository.count({ where: { type: ChannelType.VOICE } });

    const totalMessages = await this.messageRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await this.messageRepository.count({
      where: { createdAt: { $gte: today } as any },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
        byRole: usersByRole,
      },
      servers: {
        total: totalServers,
        active: activeServers,
        blocked: blockedServers,
        withChannels: serversWithChannels,
      },
      channels: {
        total: totalChannels,
        text: textChannels,
        voice: voiceChannels,
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
      },
    };
  }

  async getUsers(page: number = 1, limit: number = 20, search?: string, role?: UserRoleEnum, status?: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status === 'active') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });
    } else if (status === 'blocked') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: false });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profilePicture: user.profilePicture,
        status: user.status,
        tag: user.tag,
        createdAt: user.createdAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      status: user.status,
      tag: user.tag,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(id: number, updateUserAdminDto: UpdateUserAdminDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserAdminDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      status: user.status,
      tag: user.tag,
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  async getServers(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.serverRepository.createQueryBuilder('server');

    if (search) {
      queryBuilder.andWhere('server.name LIKE :search', { search: `%${search}%` });
    }

    if (status === 'active') {
      queryBuilder.andWhere('server.isBlocked = :isBlocked', { isBlocked: false });
    } else if (status === 'blocked') {
      queryBuilder.andWhere('server.isBlocked = :isBlocked', { isBlocked: true });
    }

    const [servers, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      servers: servers.map((server) => ({
        id: server.id,
        name: server.name,
        description: server.description,
        icon: server.icon,
        ownerId: server.ownerId,
        isBlocked: server.isBlocked,
        blockReason: server.blockReason,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getServerById(id: number) {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }
    return {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      ownerId: server.ownerId,
      isBlocked: server.isBlocked,
      blockReason: server.blockReason,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
    };
  }

  async blockServer(id: number, blockServerDto: BlockServerDto) {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    server.isBlocked = true;
    server.blockReason = blockServerDto.reason;
    await this.serverRepository.save(server);
  }

  async unblockServer(id: number) {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    server.isBlocked = false;
    server.blockReason = '';
    await this.serverRepository.save(server);
  }

  async deleteServer(id: number) {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    await this.serverRepository.remove(server);
  }

  async getLogs() {
    // This is a placeholder for log retrieval
    // In a real implementation, you would query a logs table
    return {
      logs: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
  }
}
