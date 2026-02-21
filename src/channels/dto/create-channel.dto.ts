import { IsString, IsEnum, MaxLength } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class CreateChannelDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;
}
