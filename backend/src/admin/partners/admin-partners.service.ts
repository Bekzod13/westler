import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelType } from '../admin.constants';
import { paginationArgs } from '../common/admin-pagination';
import { modelIdsMatchingTranslationContent } from '../common/translation-content-search';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './admin-partners.dto';

@Injectable()
export class AdminPartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  private async buildListWhere(q?: string): Promise<Prisma.PartnerWhereInput> {
    const search = q?.trim();
    if (!search) return {};
    const ids = await modelIdsMatchingTranslationContent(
      this.prisma,
      ModelType.Partner,
      search,
    );
    const idNum = Number.parseInt(search, 10);
    const or: Prisma.PartnerWhereInput[] = [{ link: { contains: search } }];
    if (ids.length > 0) or.push({ id: { in: ids } });
    if (!Number.isNaN(idNum) && String(idNum) === search) {
      or.push({ id: idNum });
    }
    return { OR: or };
  }

  async findAll(page: number, perPage: number, q?: string) {
    const { take, skip } = paginationArgs(page, perPage);
    const where = await this.buildListWhere(q);
    const [total, rows] = await Promise.all([
      this.prisma.partner.count({ where }),
      this.prisma.partner.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
    ]);
    const data = await Promise.all(rows.map((p) => this.withTranslations(p)));
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const row = await this.prisma.partner.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Partner ${id} not found`);
    return this.withTranslations(row);
  }

  private async withTranslations(partner: {
    id: number;
    image: string;
    link: string;
  }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.Partner,
      partner.id,
    );
    return { ...partner, translations };
  }

  async create(dto: CreatePartnerDto) {
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
      ModelType.Partner,
      dto.translations,
      activeLanguages,
    );
    return this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: { image: dto.image, link: dto.link },
      });
      await this.translations.upsertTranslations(
        tx,
        ModelType.Partner,
        partner.id,
        dto.translations,
        activeLanguages,
      );
      return this.findOne(partner.id);
    });
  }

  async update(id: number, dto: UpdatePartnerDto) {
    await this.findOne(id);
    const activeLanguages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, code: true },
    });
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.Partner,
        dto.translations,
        activeLanguages,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.partner.update({
        where: { id },
        data: {
          ...(dto.image !== undefined && { image: dto.image }),
          ...(dto.link !== undefined && { link: dto.link }),
        },
      });
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.Partner,
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
      await this.translations.deleteForModel(tx, ModelType.Partner, id);
      await tx.partner.delete({ where: { id } });
    });
  }
}
