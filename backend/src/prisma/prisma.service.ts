import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';

function sqliteFilePath(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./dev.db';
  const relative = raw.startsWith('file:') ? raw.slice('file:'.length) : raw;
  return resolve(process.cwd(), relative);
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath() });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
