import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  newPassword: string;
}
