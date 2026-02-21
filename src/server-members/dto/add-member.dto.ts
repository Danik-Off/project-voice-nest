import { IsNumber, IsEnum } from 'class-validator';
import { MemberRole } from '../entities/server-member.entity';

export class AddMemberDto {
  @IsNumber()
  userId: number;

  @IsEnum(MemberRole)
  role: MemberRole;
}
