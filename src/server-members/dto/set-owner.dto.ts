import { IsNumber } from 'class-validator';

export class SetOwnerDto {
  @IsNumber()
  userId: number;
}
