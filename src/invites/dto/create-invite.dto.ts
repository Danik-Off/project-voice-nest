import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateInviteDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  maxUses?: number;
}
