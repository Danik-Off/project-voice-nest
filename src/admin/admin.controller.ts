import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { BlockServerDto } from './dto/block-server.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import { UserRoleEnum } from '../users/entities/user.entity';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(@CurrentUser() user: CurrentUserData) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['user', 'moderator', 'admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'blocked'] })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUsers(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
      role as UserRoleEnum,
      status,
    );
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(Number(id));
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.updateUser(Number(id), updateUserAdminDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.deleteUser(Number(id));
  }

  @Get('servers')
  @ApiOperation({ summary: 'Get servers list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'blocked'] })
  @ApiResponse({ status: 200, description: 'Servers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getServers(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getServers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
      status,
    );
  }

  @Get('servers/:id')
  @ApiOperation({ summary: 'Get server by ID' })
  @ApiResponse({ status: 200, description: 'Server retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async getServerById(@Param('id') id: string) {
    return this.adminService.getServerById(Number(id));
  }

  @Post('servers/:id/block')
  @ApiOperation({ summary: 'Block server' })
  @ApiResponse({ status: 200, description: 'Server blocked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async blockServer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() blockServerDto: BlockServerDto,
  ) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.blockServer(Number(id), blockServerDto);
  }

  @Post('servers/:id/unblock')
  @ApiOperation({ summary: 'Unblock server' })
  @ApiResponse({ status: 200, description: 'Server unblocked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async unblockServer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.unblockServer(Number(id));
  }

  @Delete('servers/:id')
  @ApiOperation({ summary: 'Delete server' })
  @ApiResponse({ status: 200, description: 'Server deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async deleteServer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.deleteServer(Number(id));
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getLogs(@CurrentUser() user: CurrentUserData) {
    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getLogs();
  }
}
