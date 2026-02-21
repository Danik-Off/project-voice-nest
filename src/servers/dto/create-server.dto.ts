import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;
}
