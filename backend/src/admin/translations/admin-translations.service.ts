import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  MAX_ADMIN_PER_PAGE,
  paginationArgs,
} from '../common/admin-pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTranslationContentDto } from './admin-translations.dto';

@Injectable()
export class AdminTranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(
    modelType?: string,
    modelId?: number,
    q?: string,
  ): Prisma.TranslationWhereInput {
    const searchTrim = q?.trim();
    const or: Prisma.TranslationWhereInput[] = [];
    if (searchTrim) {
      or.push(
        { content: { contains: searchTrim } },
        { field: { contains: searchTrim } },
        { modelType: { contains: searchTrim } },
        { language: { code: { contains: searchTrim } } },
      );
      const idNum = Number.parseInt(searchTrim, 10);
      if (!Number.isNaN(idNum) && String(idNum) === searchTrim) {
        or.push({ modelId: idNum });
      }
    }

    const searchClause: Prisma.TranslationWhereInput | undefined =
      or.length > 0 ? { OR: or } : undefined;

    return {
      ...(modelType !== undefined && modelType !== '' && { modelType }),
      ...(modelId !== undefined && { modelId }),
      ...(searchClause ?? {}),
    };
  }

  async findAll(
    modelType: string | undefined,
    modelId: number | undefined,
    page: number,
    perPage: number,
    q?: string,
  ) {
    const take = Math.min(perPage, MAX_ADMIN_PER_PAGE);
    const { skip } = paginationArgs(page, take);
    const where = this.buildWhere(modelType, modelId, q);
    const orderBy: Prisma.TranslationOrderByWithRelationInput[] = [
      { modelType: 'asc' },
      { modelId: 'asc' },
      { field: 'asc' },
    ];
    const [total, data] = await Promise.all([
      this.prisma.translation.count({ where }),
      this.prisma.translation.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          language: { select: { id: true, code: true, name: true } },
        },
      }),
    ]);
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const row = await this.prisma.translation.findUnique({
      where: { id },
      include: {
        language: { select: { id: true, code: true, name: true } },
      },
    });
    if (!row) throw new NotFoundException(`Translation ${id} not found`);
    return row;
  }

  async update(id: number, dto: UpdateTranslationContentDto) {
    await this.findOne(id);
    return this.prisma.translation.update({
      where: { id },
      data: { content: dto.content },
      include: {
        language: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.translation.delete({ where: { id } });
  }
}
