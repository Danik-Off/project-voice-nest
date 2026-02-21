import { Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Invites')
@Controller('api/invite')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post(':serverId/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an invite' })
  @ApiResponse({ status: 201, description: 'Invite created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async createInvite(
    @Param('serverId') serverId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.invitesService.createInvite(Number(serverId), user.id, createInviteDto);
  }

  @Get('invite/:token')
  @ApiOperation({ summary: 'Get invite by token (public)' })
  @ApiResponse({ status: 200, description: 'Invite retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  @ApiResponse({ status: 400, description: 'Invite expired or max uses reached' })
  async getInviteByToken(@Param('token') token: string) {
    return this.invitesService.getInviteByToken(token);
  }

  @Post('invite/:token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an invite' })
  @ApiResponse({ status: 200, description: 'Invite accepted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invite expired or user already a member' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async acceptInvite(@Param('token') token: string, @CurrentUser() user: CurrentUserData) {
    return this.invitesService.acceptInvite(token, user.id);
  }

  @Get(':serverId/invites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get server invites' })
  @ApiResponse({ status: 200, description: 'Invites retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getServerInvites(@Param('serverId') serverId: string, @CurrentUser() user: CurrentUserData) {
    return this.invitesService.getServerInvites(Number(serverId), user.id);
  }

  @Delete(':inviteId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an invite' })
  @ApiResponse({ status: 204, description: 'Invite deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async deleteInvite(@Param('inviteId') inviteId: string, @CurrentUser() user: CurrentUserData) {
    return this.invitesService.deleteInvite(Number(inviteId), user.id);
  }
}
