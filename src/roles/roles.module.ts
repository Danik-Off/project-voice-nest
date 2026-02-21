import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Server } from '../servers/entities/server.entity';
import { ServerMember } from '../server-members/entities/server-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Server, ServerMember])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
