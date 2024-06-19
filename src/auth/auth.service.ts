import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { SignOptions, sign, verify } from 'jsonwebtoken';
import { v4 as Uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthDto, GetAccessTokenDto } from './dtos';
import { AuthType, JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly _jwtPrivateKey;
  private readonly _expiresInSeconds: number;
  private readonly _tokenType: string;
  private readonly _refreshTokenTtl: number;
  private readonly _jwtPublicKey;
  private readonly _jwtOptions: SignOptions;

  constructor(
    private readonly _prisma: PrismaService,
    private readonly _usersService: UsersService,
  ) {
    this._expiresInSeconds = 60000;
    this._tokenType = 'Bearer';
    this._refreshTokenTtl = 1;
    this._jwtPublicKey = fs.readFileSync(
      `${process.cwd()}/assets/jwt.public.key`,
    );
    this._jwtPrivateKey = fs.readFileSync(
      `${process.cwd()}/assets/jwt.private.key`,
    );
    this._jwtOptions = {
      expiresIn: this._expiresInSeconds,
      algorithm: 'RS256',
      keyid: 'main',
    };
  }

  async signIn(dto: AuthDto): Promise<AuthType> {
    const loginResults = await this._usersService.login(dto);
    if (!loginResults) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { id, role } = loginResults;
    const payload: JwtPayload = {
      sub: id,
      role,
    };

    const jwt = await this._createJWT(payload);

    return jwt;
  }

  async logout(userId: string, refreshToken: string): Promise<boolean> {
    const result = await this._prisma.refreshToken.delete({
      where: {
        user_id: userId,
        value: refreshToken,
      },
    });

    if (!result) {
      throw new HttpException('RefreshToken not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }

  async logoutFromAll(userId: string): Promise<boolean> {
    await this._prisma.refreshToken.deleteMany({
      where: {
        user_id: userId,
      },
    });
    return true;
  }

  async getAccessTokenFromRefreshToken(
    dto: GetAccessTokenDto,
  ): Promise<AuthType> {
    const { refreshToken, accessToken: oldAccessToken } = dto;
    const token = await this._prisma.refreshToken.findFirst({
      where: {
        value: refreshToken,
      },
    });
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
    }
    const currentDate = new Date();
    if (token.expiresAt < currentDate) {
      throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
    }
    const oldPayload = await this._validateToken(oldAccessToken, true);
    const payload: JwtPayload = {
      sub: oldPayload.sub,
      role: oldPayload.role,
    };

    const jwt = await this._createJWT(payload);

    await this._prisma.refreshToken.delete({
      where: {
        id: token.id,
      },
    });

    return jwt;
  }

  private async _createJWT(payload: JwtPayload): Promise<AuthType> {
    const jwt = await this._createAccessToken(payload);
    jwt.refreshToken = await this._createRefreshToken({
      userId: payload.sub,
    });

    return jwt;
  }

  private async _createAccessToken(
    payload: JwtPayload,
    expires = this._expiresInSeconds,
  ): Promise<AuthType> {
    const options = this._jwtOptions;
    options.jwtid = Uuidv4();

    const signedPayload = sign(payload, this._jwtPrivateKey, options);

    return {
      accessToken: signedPayload,
      expiresIn: expires,
      tokenType: this._tokenType,
    } as AuthType;
  }

  private async _createRefreshToken(tokenContent: {
    userId: string;
  }): Promise<string> {
    const { userId } = tokenContent;
    const refreshToken = randomBytes(64).toString('hex');
    const currentDate = new Date();
    const nextDay = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const token = {
      user_id: userId,
      value: refreshToken,
      expiresAt: nextDay,
    };
    const newRefreshToken = await this._prisma.refreshToken.create({
      data: token,
    });

    return newRefreshToken.value;
  }

  private async _validateToken(
    token: string,
    ignoreExpiration = false,
  ): Promise<JwtPayload> {
    return verify(token, this._jwtPublicKey, {
      ignoreExpiration,
    }) as JwtPayload;
  }
}
