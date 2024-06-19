import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: fs.readFileSync(`${process.cwd()}/assets/jwt.public.key`),
      algorithms: ['RS256'],
      kid: 'main',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
