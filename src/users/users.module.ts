import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from 'src/email/email.module';
import { UserAdminService } from './user-admin.service';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [UsersService, UserAdminService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
