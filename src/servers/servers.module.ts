import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { Server } from './entities/server.entity';
import { ServerMember } from '../server-members/entities/server-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Server, ServerMember])],
  controllers: [ServersController],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}
