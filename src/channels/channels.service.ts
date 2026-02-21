import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async getServerChannels(serverId: number) {
    const channels = await this.channelRepository.find({
      where: { serverId },
    });

    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      serverId: channel.serverId,
    }));
  }

  async createChannel(serverId: number, userId: number, createChannelDto: CreateChannelDto) {
    // Check if user is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to create channels');
    }

    const channel = this.channelRepository.create({
      ...createChannelDto,
      serverId,
    });

    await this.channelRepository.save(channel);

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      serverId: channel.serverId,
    };
  }

  async getChannelById(serverId: number, channelId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId, serverId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      serverId: channel.serverId,
    };
  }

  async updateChannel(serverId: number, channelId: number, userId: number, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId, serverId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to update this channel');
    }

    Object.assign(channel, updateChannelDto);
    await this.channelRepository.save(channel);

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      serverId: channel.serverId,
    };
  }

  async deleteChannel(serverId: number, channelId: number, userId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId, serverId },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if user is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to delete this channel');
    }

    await this.channelRepository.remove(channel);
  }

  async findById(id: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { id } });
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }
}
