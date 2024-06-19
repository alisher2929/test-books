import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto, GetAccessTokenDto, LogoutDto } from './dtos';
import { AuthType } from './interfaces';
import { JWTAuthGuard, UserInputDto, CurrentUser } from 'common';

@Controller('users')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('login')
  async signIn(@Body() dto: AuthDto): Promise<AuthType> {
    return this._authService.signIn(dto);
  }

  @UseGuards(JWTAuthGuard)
  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @CurrentUser() { userId }: UserInputDto,
  ): Promise<boolean> {
    if (dto.fromAll) {
      return await this._authService.logoutFromAll(userId);
    }
    return this._authService.logout(userId, dto.refreshToken);
  }

  @Post('token')
  async token(@Body() dto: GetAccessTokenDto): Promise<AuthType> {
    return this._authService.getAccessTokenFromRefreshToken(dto);
  }
}
