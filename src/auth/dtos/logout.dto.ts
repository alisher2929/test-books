import { IsBoolean, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  refreshToken: string;

  @IsBoolean()
  fromAll?: boolean;
}
