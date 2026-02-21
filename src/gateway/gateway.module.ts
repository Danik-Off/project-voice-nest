import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceGateway } from './gateway.gateway';
import { GatewayService } from './gateway.service';
import { User } from '../users/entities/user.entity';
import { ServerMember } from '../server-members/entities/server-member.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default_secret_key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    TypeOrmModule.forFeature([User, ServerMember]),
  ],
  providers: [VoiceGateway, GatewayService],
  exports: [GatewayService],
})
export class VoiceGatewayModule {}
