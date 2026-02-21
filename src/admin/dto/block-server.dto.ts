import { IsString, MinLength } from 'class-validator';

export class BlockServerDto {
  @IsString()
  @MinLength(3)
  reason: string;
}
