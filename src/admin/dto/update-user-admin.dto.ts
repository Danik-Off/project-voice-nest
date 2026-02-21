import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRoleEnum } from '../../users/entities/user.entity';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
