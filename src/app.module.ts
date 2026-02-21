import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServersModule } from './servers/servers.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { ServerMembersModule } from './server-members/server-members.module';
import { InvitesModule } from './invites/invites.module';
import { FriendsModule } from './friends/friends.module';
import { RolesModule } from './roles/roles.module';
import { AdminModule } from './admin/admin.module';
import { VoiceGatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ServersModule,
    ChannelsModule,
    MessagesModule,
    ServerMembersModule,
    InvitesModule,
    FriendsModule,
    RolesModule,
    AdminModule,
    VoiceGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
