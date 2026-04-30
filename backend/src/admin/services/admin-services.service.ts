import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelType } from '../admin.constants';
import { paginationArgs } from '../common/admin-pagination';
import { modelIdsMatchingTranslationContent } from '../common/translation-content-search';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './admin-services.dto';

@Injectable()
export class AdminServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  private async buildListWhere(q?: string): Promise<Prisma.ServiceWhereInput> {
    const search = q?.trim();
    if (!search) return {};
    const ids = await modelIdsMatchingTranslationContent(
      this.prisma,
      ModelType.Service,
      search,
    );
    const idNum = Number.parseInt(search, 10);
    const or: Prisma.ServiceWhereInput[] = [];
    if (ids.length > 0) or.push({ id: { in: ids } });
    if (!Number.isNaN(idNum) && String(idNum) === search) {
      or.push({ id: idNum });
    }
    if (or.length === 0) return { id: { in: [] } };
    return { OR: or };
  }

  async findAll(page: number, perPage: number, q?: string) {
    const { take, skip } = paginationArgs(page, perPage);
    const where = await this.buildListWhere(q);
    const [total, rows] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
    ]);
    const data = await Promise.all(rows.map((s) => this.withTranslations(s)));
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const row = await this.prisma.service.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Service ${id} not found`);
    return this.withTranslations(row);
  }

  private async withTranslations(service: { id: number; image: string }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.Service,
      service.id,
    );
    return { ...service, translations };
  }

  async create(dto: CreateServiceDto) {
    const activeLanguages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, code: true },
    });
    if (activeLanguages.length === 0) {
      throw new NotFoundException(
        'No active languages configured; add languages first',
      );
    }
    this.translations.validateTranslationsPayload(
      ModelType.Service,
      dto.translations,
      activeLanguages,
    );
    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: { image: dto.image },
      });
      await this.translations.upsertTranslations(
        tx,
        ModelType.Service,
        service.id,
        dto.translations,
        activeLanguages,
      );
      return this.findOne(service.id);
    });
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);
    const activeLanguages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, code: true },
    });
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.Service,
        dto.translations,
        activeLanguages,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.service.update({
        where: { id },
        data: {
          ...(dto.image !== undefined && { image: dto.image }),
        },
      });
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.Service,
          id,
          dto.translations,
          activeLanguages,
        );
      }
      return this.findOne(id);
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.$transaction(async (tx) => {
      await this.translations.deleteForModel(tx, ModelType.Service, id);
      await tx.service.delete({ where: { id } });
    });
  }
}
