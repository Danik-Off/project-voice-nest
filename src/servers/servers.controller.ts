import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Servers')
@Controller('api/servers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServersController {
  constructor(private serversService: ServersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user servers' })
  @ApiResponse({ status: 200, description: 'Servers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserServers(@CurrentUser() user: CurrentUserData) {
    return this.serversService.getUserServers(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new server' })
  @ApiResponse({ status: 201, description: 'Server created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createServer(
    @CurrentUser() user: CurrentUserData,
    @Body() createServerDto: CreateServerDto,
  ) {
    return this.serversService.createServer(user.id, createServerDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get server by ID' })
  @ApiResponse({ status: 200, description: 'Server retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Server is blocked' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async getServerById(@Param('id') id: string) {
    return this.serversService.getServerById(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update server' })
  @ApiResponse({ status: 200, description: 'Server updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async updateServer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateServerDto: UpdateServerDto,
  ) {
    return this.serversService.updateServer(Number(id), user.id, updateServerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete server' })
  @ApiResponse({ status: 204, description: 'Server deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async deleteServer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.serversService.deleteServer(Number(id), user.id);
  }
}
