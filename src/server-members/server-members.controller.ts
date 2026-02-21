import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServerMembersService } from './server-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { SetOwnerDto } from './dto/set-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('ServerMembers')
@Controller('api/serverMembers/:serverId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServerMembersController {
  constructor(private serverMembersService: ServerMembersService) {}

  @Get('members')
  @ApiOperation({ summary: 'Get server members' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getServerMembers(@Param('serverId') serverId: string) {
    return this.serverMembersService.getServerMembers(Number(serverId));
  }

  @Post('members')
  @ApiOperation({ summary: 'Add a member to server' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async addMember(
    @Param('serverId') serverId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.serverMembersService.addMember(Number(serverId), user.id, addMemberDto);
  }

  @Put('members/:memberId')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateMemberRole(
    @Param('serverId') serverId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.serverMembersService.updateMemberRole(
      Number(serverId),
      Number(memberId),
      user.id,
      updateMemberRoleDto,
    );
  }

  @Delete('members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from server' })
  @ApiResponse({ status: 204, description: 'Member removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async removeMember(
    @Param('serverId') serverId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.serverMembersService.removeMember(Number(serverId), Number(memberId), user.id);
  }

  @Post('owner')
  @ApiOperation({ summary: 'Transfer server ownership' })
  @ApiResponse({ status: 200, description: 'Ownership transferred successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server or user not found' })
  async setOwner(
    @Param('serverId') serverId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() setOwnerDto: SetOwnerDto,
  ) {
    return this.serverMembersService.setOwner(Number(serverId), user.id, setOwnerDto);
  }
}
