import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { User } from '../users/entities/user.entity';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';

export interface PaginatedMessagesResponse {
  messages: Array<{
    id: number;
    content: string;
    userId: number;
    channelId: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: number;
      username: string;
      avatar: string;
    };
    isEdited: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async getMessages(channelId: number, page: number = 1, limit: number = 50): Promise<PaginatedMessagesResponse> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { channelId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        userId: message.userId,
        channelId: message.channelId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        user: {
          id: message.user.id,
          username: message.user.username,
          avatar: message.user.profilePicture || '',
        },
        isEdited: message.isEdited,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createMessage(userId: number, createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create({
      ...createMessageDto,
      userId,
    });

    await this.messageRepository.save(message);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: message.id,
      content: message.content,
      userId: message.userId,
      channelId: message.channelId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.profilePicture || '',
      },
      isEdited: message.isEdited,
    };
  }

  async updateMessage(id: number, userId: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['channel'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the author or moderator
    const isAuthor = message.userId === userId;
    let isModerator = false;

    if (!isAuthor) {
      const membership = await this.serverMemberRepository.findOne({
        where: { serverId: message.channel.serverId, userId },
      });
      isModerator = !!membership && (membership.role === MemberRole.MODERATOR || membership.role === MemberRole.ADMIN);
    }

    if (!isAuthor && !isModerator) {
      throw new ForbiddenException('You do not have permission to update this message');
    }

    message.content = updateMessageDto.content;
    message.isEdited = true;

    await this.messageRepository.save(message);

    return {
      id: message.id,
      content: message.content,
      isEdited: message.isEdited,
    };
  }

  async deleteMessage(id: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['channel'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the author or moderator
    const isAuthor = message.userId === userId;
    let isModerator = false;

    if (!isAuthor) {
      const membership = await this.serverMemberRepository.findOne({
        where: { serverId: message.channel.serverId, userId },
      });
      isModerator = !!membership && (membership.role === MemberRole.MODERATOR || membership.role === MemberRole.ADMIN);
    }

    if (!isAuthor && !isModerator) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    await this.messageRepository.remove(message);
  }

  async searchMessages(
    channelId: number,
    query: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedMessagesResponse> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: {
        channelId,
        content: Like(`%${query}%`),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        userId: message.userId,
        channelId: message.channelId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        user: {
          id: message.user.id,
          username: message.user.username,
          avatar: message.user.profilePicture || '',
        },
        isEdited: message.isEdited,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }
}
