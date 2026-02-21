import { IsEnum } from 'class-validator';
import { MemberRole } from '../entities/server-member.entity';

export class UpdateMemberRoleDto {
  @IsEnum(MemberRole)
  role: MemberRole;
}
