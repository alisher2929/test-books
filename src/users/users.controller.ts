import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { UserRoles } from '@prisma/booksCollection-client';

import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateRole, UserDto } from './dtos';
import { UserType } from './interfaces';
import { JWTAuthGuard, UserInputDto, CurrentUser, RoleGuard } from 'common';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post('register')
  async signUp(@Body() dto: UserDto): Promise<UserType> {
    return this._usersService.signUp(dto);
  }

  @UseGuards(JWTAuthGuard)
  @Put('password')
  async password(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() { userId }: UserInputDto,
  ): Promise<boolean> {
    return this._usersService.changePassword(dto, userId);
  }

  @UseGuards(JWTAuthGuard, new RoleGuard([UserRoles.ADMIN]))
  @Put(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRole,
  ): Promise<Pick<UserType, 'username' | 'role' | 'email'>> {
    return this._usersService.updateRole(dto, id);
  }

  @UseGuards(JWTAuthGuard)
  @Get('me')
  async userInfo(
    @CurrentUser() { userId }: UserInputDto,
  ): Promise<Pick<UserType, 'username' | 'role' | 'email'>> {
    return this._usersService.getUserByid(userId);
  }

  @Get('confirm')
  async confirm(@Query('code') code: string) {
    const result = await this._usersService.confirmEmail(code);
  }
}
