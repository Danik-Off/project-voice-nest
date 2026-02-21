import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Server } from '../servers/entities/server.entity';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  async getServerRoles(serverId: number) {
    const roles = await this.roleRepository.find({
      where: { serverId },
      order: { position: 'ASC' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions.toString(),
      position: role.position,
      isHoisted: role.isHoisted,
      isMentionable: role.isMentionable,
      serverId: role.serverId,
    }));
  }

  async createRole(serverId: number, userId: number, createRoleDto: CreateRoleDto) {
    const server = await this.serverRepository.findOne({ where: { id: serverId } });
    if (!server) {
      throw new NotFoundException('Server not found');
    }

    // Check if user has permission to manage roles
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.ADMIN && membership.role !== MemberRole.MODERATOR)) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      serverId,
      permissions: BigInt(createRoleDto.permissions || 0),
    });

    await this.roleRepository.save(role);

    return {
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions.toString(),
      position: role.position,
      isHoisted: role.isHoisted,
      isMentionable: role.isMentionable,
      serverId: role.serverId,
    };
  }

  async updateRole(serverId: number, roleId: number, userId: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, serverId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user has permission to manage roles
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.ADMIN && membership.role !== MemberRole.MODERATOR)) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    // Cannot manage roles equal to or higher than your own
    if (role.position >= 0 && membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Cannot manage roles equal to or higher than your own');
    }

    Object.assign(role, updateRoleDto);
    if (updateRoleDto.permissions !== undefined) {
      role.permissions = BigInt(updateRoleDto.permissions);
    }

    await this.roleRepository.save(role);

    return {
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions.toString(),
      position: role.position,
      isHoisted: role.isHoisted,
      isMentionable: role.isMentionable,
      serverId: role.serverId,
    };
  }

  async deleteRole(serverId: number, roleId: number, userId: number) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, serverId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Cannot delete @everyone role (position 0)
    if (role.position === 0) {
      throw new BadRequestException('Cannot delete @everyone role');
    }

    // Check if user has permission to manage roles
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.ADMIN && membership.role !== MemberRole.MODERATOR)) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    // Cannot delete roles equal to or higher than your own
    if (role.position >= 0 && membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Cannot delete roles equal to or higher than your own');
    }

    await this.roleRepository.remove(role);
  }

  async assignRoleToMember(serverId: number, memberId: number, roleId: number, userId: number) {
    const member = await this.serverMemberRepository.findOne({
      where: { id: memberId, serverId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, serverId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user has permission to manage roles
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.ADMIN && membership.role !== MemberRole.MODERATOR)) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    // Cannot assign roles equal to or higher than your own
    if (role.position >= 0 && membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Cannot assign roles equal to or higher than your own');
    }

    if (!member.roles) {
      member.roles = [];
    }

    member.roles.push(role);
    await this.serverMemberRepository.save(member);

    return { message: 'Роль успешно назначена.' };
  }

  async removeRoleFromMember(serverId: number, memberId: number, roleId: number, userId: number) {
    const member = await this.serverMemberRepository.findOne({
      where: { id: memberId, serverId },
      relations: ['roles'],
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, serverId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user has permission to manage roles
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership || (membership.role !== MemberRole.ADMIN && membership.role !== MemberRole.MODERATOR)) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    // Cannot remove roles equal to or higher than your own
    if (role.position >= 0 && membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Cannot remove roles equal to or higher than your own');
    }

    member.roles = member.roles.filter((r) => r.id !== roleId);
    await this.serverMemberRepository.save(member);
  }
}
