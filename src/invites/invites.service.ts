import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Invite } from './entities/invite.entity';
import { Server } from '../servers/entities/server.entity';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private inviteRepository: Repository<Invite>,
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async createInvite(serverId: number, userId: number, createInviteDto: CreateInviteDto) {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if user is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to create invites');
    }

    const token = uuidv4();
    const invite = this.inviteRepository.create();
    invite.token = token;
    invite.serverId = serverId;
    invite.createdBy = userId;
    if (createInviteDto.maxUses !== undefined) {
      invite.maxUses = createInviteDto.maxUses;
    }
    if (createInviteDto.expiresAt) {
      invite.expiresAt = new Date(createInviteDto.expiresAt);
    }

    await this.inviteRepository.save(invite);

    return {
      invite: {
        id: invite.id,
        token: invite.token,
        serverId: invite.serverId,
        createdBy: invite.createdBy,
        maxUses: invite.maxUses,
        uses: invite.uses,
        expiresAt: invite.expiresAt,
      },
    };
  }

  async getInviteByToken(token: string) {
    const invite = await this.inviteRepository.findOne({
      where: { token },
      relations: ['server'],
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new BadRequestException('Invite has expired');
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new BadRequestException('Invite has reached maximum uses');
    }

    return {
      invite: {
        id: invite.id,
        token: invite.token,
        serverId: invite.serverId,
        maxUses: invite.maxUses,
        uses: invite.uses,
        expiresAt: invite.expiresAt,
      },
      server: {
        id: invite.server.id,
        name: invite.server.name,
        description: invite.server.description,
        icon: invite.server.icon,
      },
    };
  }

  async acceptInvite(token: string, userId: number) {
    const invite = await this.inviteRepository.findOne({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw new BadRequestException('Invite has expired');
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new BadRequestException('Invite has reached maximum uses');
    }

    // Check if user is already a member
    const existingMember = await this.serverMemberRepository.findOne({
      where: { serverId: invite.serverId, userId },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this server');
    }

    // Add user to server
    const member = this.serverMemberRepository.create({
      serverId: invite.serverId,
      userId,
      role: MemberRole.MEMBER,
    });

    await this.serverMemberRepository.save(member);

    // Increment invite uses
    invite.uses += 1;
    await this.inviteRepository.save(invite);

    return { message: 'User added to server' };
  }

  async getServerInvites(serverId: number, userId: number) {
    // Check if user is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to view invites');
    }

    const invites = await this.inviteRepository.find({
      where: { serverId },
    });

    return invites.map((invite) => ({
      id: invite.id,
      token: invite.token,
      serverId: invite.serverId,
      createdBy: invite.createdBy,
      maxUses: invite.maxUses,
      uses: invite.uses,
      expiresAt: invite.expiresAt,
    }));
  }

  async deleteInvite(inviteId: number, userId: number) {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Check if user is admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId: invite.serverId, userId },
    });

    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete invites');
    }

    await this.inviteRepository.remove(invite);
  }
}
