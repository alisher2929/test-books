import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import _ from 'lodash';
import * as fs from 'fs';

import { PrismaService } from '../prisma/prisma.service';
import { UserRoles } from '@prisma/books-client';
import { AdminType } from './interfaces';

@Injectable()
export class UserAdminService implements OnApplicationBootstrap {
  private readonly _logger = new Logger(UserAdminService.name);
  private readonly _filePath = `admin.json`;
  constructor(private readonly _prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const admin = await this._getAdminAccount();
    const { username, password, email } = admin;
    const createdAdmin = await this._prisma.users.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password,
        role: UserRoles.ADMIN,
        email,
        isActive: true,
      },
    });
    this._logger.log(`Admin with id ${createdAdmin.id} was created or found`);
  }

  private async _getAdminAccount(): Promise<AdminType> {
    this._logger.debug(`Read admin account data from ${this._filePath}...`);
    return JSON.parse(
      fs.readFileSync(`${process.cwd()}/assets/${this._filePath}`).toString(),
    ) as AdminType;
  }
}
