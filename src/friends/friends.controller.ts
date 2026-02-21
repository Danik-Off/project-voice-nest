import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Friends')
@Controller('api/friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Get friends' })
  @ApiResponse({ status: 200, description: 'Friends retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFriends(@CurrentUser() user: CurrentUserData) {
    return this.friendsService.getFriends(user.id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get friend requests' })
  @ApiResponse({ status: 200, description: 'Friend requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFriendRequests(@CurrentUser() user: CurrentUserData) {
    return this.friendsService.getFriendRequests(user.id);
  }

  @Post('request')
  @ApiOperation({ summary: 'Send friend request' })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'User is blocked' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendFriendRequest(
    @CurrentUser() user: CurrentUserData,
    @Body() sendFriendRequestDto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendFriendRequest(user.id, sendFriendRequestDto);
  }

  @Post('accept/:requestId')
  @ApiOperation({ summary: 'Accept friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async acceptFriendRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.friendsService.acceptFriendRequest(Number(requestId), user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove friend or reject request' })
  @ApiResponse({ status: 200, description: 'Friend removed or request rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async removeFriendOrRejectRequest(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.friendsService.removeFriendOrRejectRequest(Number(id), user.id);
  }

  @Post('block/:targetUserId')
  @ApiOperation({ summary: 'Block user' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async blockUser(
    @Param('targetUserId') targetUserId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.friendsService.blockUser(user.id, Number(targetUserId));
  }

  @Get('blocked')
  @ApiOperation({ summary: 'Get blocked users' })
  @ApiResponse({ status: 200, description: 'Blocked users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBlockedUsers(@CurrentUser() user: CurrentUserData) {
    return this.friendsService.getBlockedUsers(user.id);
  }
}
