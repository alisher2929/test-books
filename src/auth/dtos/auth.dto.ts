import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  username: string;

  readonly password: string;
}
