import { IsNotEmpty, IsString } from 'class-validator';

export class GetAccessTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
