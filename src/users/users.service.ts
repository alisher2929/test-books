import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import _ from 'lodash';
import { Users, UserRoles, Codes } from '@prisma/booksCollection-client';
import { v4 as Uuidv4 } from 'uuid';

import { ChangePasswordDto, UpdateRole, UserDto } from './dtos';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from './interfaces';
import { AuthDto } from 'src/auth/dtos';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _emailService: EmailService,
    private readonly _configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this._prisma.users.findFirst({
      where: {
        username,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new HttpException('Password mismatch', HttpStatus.FORBIDDEN);
    }
    return user;
  }

  async getUserByid(
    userId: string,
  ): Promise<Pick<UserType, 'username' | 'role' | 'email'>> {
    const user = await this._prisma.users.findFirst({
      where: {
        id: userId,
      },
      select: {
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async signUp(dto: UserDto): Promise<Users> {
    const { username, password, email } = dto;
    const checkUser = await this._prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (checkUser) {
      throw new HttpException('User already registered', HttpStatus.FORBIDDEN);
    }

    const newUser = await this._prisma.users.create({
      data: {
        username,
        password: await this._hashPassword(password),
        email,
      },
    });
    const newCode = await this._createConfirmationCode(newUser.id);
    const confirmationUrl = `${this._configService.get<string>('MAIL_URL')}=${newCode.code}`;
    const text = `${this._configService.get<string>('MAIL_TEXT')}: ${confirmationUrl}`;
    await this._emailService.sendMail(
      email,
      this._configService.get<string>('MAIL_SUBJECT'),
      text,
    );

    return newUser;
  }

  async changePassword(
    dto: ChangePasswordDto,
    userId: string,
  ): Promise<boolean> {
    const { oldPassword, newPassword } = dto;
    const user = await this._prisma.users.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const passwordMatch = await compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new HttpException('Password mismatch', HttpStatus.FORBIDDEN);
    }
    const password = await this._hashPassword(newPassword);
    await this._prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        password: password,
      },
    });
    await this._logoutFromAll(user.id);

    return true;
  }

  async login(dto: AuthDto): Promise<Users> {
    const { username, password } = dto;

    const user = await this._prisma.users.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      throw new HttpException(
        `User with username ${username} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.isActive === false) {
      throw new HttpException(`Not verified user`, HttpStatus.FORBIDDEN);
    }

    if (user.role === UserRoles.ADMIN) {
      if (password === user.password) {
        return user;
      }
      throw new HttpException(`Admin not found`, HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new HttpException(`Password mismatch`, HttpStatus.FORBIDDEN);
    }

    return user;
  }

  async updateRole(
    dto: UpdateRole,
    userId: string,
  ): Promise<Pick<UserType, 'username' | 'role' | 'email'>> {
    const { role } = dto;
    const user = await this._prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
      select: {
        role: true,
        username: true,
        email: true,
      },
    });
    return user;
  }

  async confirmEmail(code: string): Promise<boolean> {
    const confirmCode = await this._prisma.codes.findUnique({
      where: { code },
    });

    if (!confirmCode) {
      return false;
    }

    await this._prisma.users.update({
      where: { id: confirmCode.user_id },
      data: { isActive: true },
    });

    await this._prisma.codes.delete({
      where: { id: confirmCode.id },
    });

    return true;
  }

  protected async _hashPassword(password: string): Promise<string> {
    const salt = await genSalt(12)
    const hashedPassword = await hash(password, salt)

    return hashedPassword;
  }

  private async _logoutFromAll(userId: string): Promise<boolean> {
    await this._prisma.refreshToken.deleteMany({
      where: {
        user_id: userId,
      },
    });
    return true;
  }

  private async _createConfirmationCode(userId: string): Promise<Codes> {
    const code = Uuidv4();
    return await this._prisma.codes.create({
      data: {
        code,
        user_id: userId,
      },
    });
  }
}
