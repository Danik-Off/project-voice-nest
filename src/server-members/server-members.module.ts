import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerMembersController } from './server-members.controller';
import { ServerMembersService } from './server-members.service';
import { ServerMember } from './entities/server-member.entity';
import { Server } from '../servers/entities/server.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServerMember, Server, User])],
  controllers: [ServerMembersController],
  providers: [ServerMembersService],
  exports: [ServerMembersService, TypeOrmModule],
})
export class ServerMembersModule {}
