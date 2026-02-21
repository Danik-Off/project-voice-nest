import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from './entities/server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async getUserServers(userId: number) {
    const memberships = await this.serverMemberRepository.find({
      where: { userId },
      relations: ['server', 'server.channels', 'server.members'],
    });

    return memberships.map((membership) => ({
      id: membership.server.id,
      name: membership.server.name,
      description: membership.server.description,
      icon: membership.server.icon,
      ownerId: membership.server.ownerId,
      channels: membership.server.channels,
      members: membership.server.members,
    }));
  }

  async createServer(userId: number, createServerDto: CreateServerDto) {
    const server = this.serverRepository.create({
      ...createServerDto,
      ownerId: userId,
    });

    await this.serverRepository.save(server);

    // Add the owner as a member with admin role
    const member = this.serverMemberRepository.create({
      userId,
      serverId: server.id,
      role: MemberRole.ADMIN,
    });

    await this.serverMemberRepository.save(member);

    return {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      ownerId: server.ownerId,
    };
  }

  async getServerById(id: number) {
    const server = await this.serverRepository.findOne({
      where: { id },
      relations: ['channels', 'members'],
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.isBlocked) {
      throw new ForbiddenException('Server is blocked');
    }

    return {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      ownerId: server.ownerId,
      channels: server.channels,
      members: server.members,
    };
  }

  async updateServer(id: number, userId: number, updateServerDto: UpdateServerDto) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if user is owner or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId: id, userId },
    });

    if (!membership || (server.ownerId !== userId && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to update this server');
    }

    Object.assign(server, updateServerDto);
    await this.serverRepository.save(server);

    return {
      id: server.id,
      name: server.name,
      description: server.description,
      icon: server.icon,
      ownerId: server.ownerId,
    };
  }

  async deleteServer(id: number, userId: number) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if user is owner or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId: id, userId },
    });

    if (!membership || (server.ownerId !== userId && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to delete this server');
    }

    await this.serverRepository.remove(server);
  }

  async findById(id: number): Promise<Server> {
    const server = await this.serverRepository.findOne({ where: { id } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }
    return server;
  }
}
