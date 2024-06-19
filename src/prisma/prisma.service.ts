import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/booksCollection-client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public static instance: PrismaService;

  private logger = new Logger(PrismaService.name);

  constructor(private readonly _configService: ConfigService) {
    const databaseUrl = _configService.get<string>('PSQL_DATABASE_URL');
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    PrismaService.instance = this;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (err: any) {
      this.logger.error(err, err.stack);
      this.$disconnect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
