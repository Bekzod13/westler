import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicContentService } from './public-content.service';
import { PublicController } from './public.controller';
import { PublicOrdersService } from './public-orders.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicContentService, PublicOrdersService],
})
export class PublicModule {}
