import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePicture?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
