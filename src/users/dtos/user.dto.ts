import { IsString } from 'class-validator';

export class UserDto {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  readonly password: string;
}
