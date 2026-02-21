import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('api/servers/:serverId/roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get server roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getServerRoles(@Param('serverId') serverId: string) {
    return this.rolesService.getServerRoles(Number(serverId));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async createRole(
    @Param('serverId') serverId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.createRole(Number(serverId), user.id, createRoleDto);
  }

  @Patch(':roleId')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('serverId') serverId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(Number(serverId), Number(roleId), user.id, updateRoleDto);
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete @everyone role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(
    @Param('serverId') serverId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.rolesService.deleteRole(Number(serverId), Number(roleId), user.id);
  }

  @Post('members/:memberId/roles/:roleId')
  @ApiOperation({ summary: 'Assign role to member' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member or role not found' })
  async assignRoleToMember(
    @Param('serverId') serverId: string,
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.rolesService.assignRoleToMember(
      Number(serverId),
      Number(memberId),
      Number(roleId),
      user.id,
    );
  }

  @Delete('members/:memberId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from member' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member or role not found' })
  async removeRoleFromMember(
    @Param('serverId') serverId: string,
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.rolesService.removeRoleFromMember(
      Number(serverId),
      Number(memberId),
      Number(roleId),
      user.id,
    );
  }
}
