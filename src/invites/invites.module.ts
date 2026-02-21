import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { Invite } from './entities/invite.entity';
import { Server } from '../servers/entities/server.entity';
import { ServerMember } from '../server-members/entities/server-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, Server, ServerMember])],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
