import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerMember, MemberRole } from './entities/server-member.entity';
import { Server } from '../servers/entities/server.entity';
import { User } from '../users/entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { SetOwnerDto } from './dto/set-owner.dto';

@Injectable()
export class ServerMembersService {
  constructor(
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getServerMembers(serverId: number) {
    const members = await this.serverMemberRepository.find({
      where: { serverId },
      relations: ['user'],
    });

    return members.map((member) => ({
      id: member.id,
      userId: member.userId,
      serverId: member.serverId,
      role: member.role,
      user: {
        id: member.user.id,
        username: member.user.username,
        profilePicture: member.user.profilePicture,
      },
    }));
  }

  async addMember(serverId: number, userId: number, addMemberDto: AddMemberDto) {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    const user = await this.userRepository.findOne({ where: { id: addMemberDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if requester is moderator or admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.MODERATOR && membership.role !== MemberRole.ADMIN)) {
      throw new ForbiddenException('You do not have permission to add members');
    }

    // Check if user is already a member
    const existingMember = await this.serverMemberRepository.findOne({
      where: { serverId, userId: addMemberDto.userId },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member');
    }

    const member = this.serverMemberRepository.create({
      serverId,
      userId: addMemberDto.userId,
      role: addMemberDto.role,
    });

    await this.serverMemberRepository.save(member);

    return {
      id: member.id,
      userId: member.userId,
      serverId: member.serverId,
      role: member.role,
    };
  }

  async updateMemberRole(serverId: number, memberId: number, userId: number, updateMemberRoleDto: UpdateMemberRoleDto) {
    const member = await this.serverMemberRepository.findOne({
      where: { id: memberId, serverId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if requester is admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update member roles');
    }

    member.role = updateMemberRoleDto.role;
    await this.serverMemberRepository.save(member);
  }

  async removeMember(serverId: number, memberId: number, userId: number) {
    const member = await this.serverMemberRepository.findOne({
      where: { id: memberId, serverId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if requester is admin
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    await this.serverMemberRepository.remove(member);
  }

  async setOwner(serverId: number, userId: number, setOwnerDto: SetOwnerDto) {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if requester is the current owner
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can transfer ownership');
    }

    const newOwner = await this.userRepository.findOne({ where: { id: setOwnerDto.userId } });
    if (!newOwner) {
      throw new NotFoundException('User not found');
    }

    // Update server owner
    server.ownerId = setOwnerDto.userId;
    await this.serverRepository.save(server);

    // Update old owner's role to admin
    const oldOwnerMember = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });
    if (oldOwnerMember) {
      oldOwnerMember.role = MemberRole.ADMIN;
      await this.serverMemberRepository.save(oldOwnerMember);
    }

    // Update new owner's role to admin
    const newOwnerMember = await this.serverMemberRepository.findOne({
      where: { serverId, userId: setOwnerDto.userId },
    });
    if (newOwnerMember) {
      newOwnerMember.role = MemberRole.ADMIN;
      await this.serverMemberRepository.save(newOwnerMember);
    }
  }
}
