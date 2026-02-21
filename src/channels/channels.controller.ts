import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Channels')
@Controller('api/servers/:serverId/channels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get server channels' })
  @ApiResponse({ status: 200, description: 'Channels retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getServerChannels(@Param('serverId') serverId: string) {
    return this.channelsService.getServerChannels(Number(serverId));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new channel' })
  @ApiResponse({ status: 201, description: 'Channel created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createChannel(
    @Param('serverId') serverId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.channelsService.createChannel(Number(serverId), user.id, createChannelDto);
  }

  @Get(':channelId')
  @ApiOperation({ summary: 'Get channel by ID' })
  @ApiResponse({ status: 200, description: 'Channel retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async getChannelById(
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.channelsService.getChannelById(Number(serverId), Number(channelId));
  }

  @Put(':channelId')
  @ApiOperation({ summary: 'Update channel' })
  @ApiResponse({ status: 200, description: 'Channel updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async updateChannel(
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.updateChannel(
      Number(serverId),
      Number(channelId),
      user.id,
      updateChannelDto,
    );
  }

  @Delete(':channelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete channel' })
  @ApiResponse({ status: 204, description: 'Channel deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  async deleteChannel(
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.channelsService.deleteChannel(Number(serverId), Number(channelId), user.id);
  }
}
