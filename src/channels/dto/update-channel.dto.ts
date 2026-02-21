import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;
}
