import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelType } from '../admin.constants';
import { paginationArgs } from '../common/admin-pagination';
import { modelIdsMatchingTranslationContent } from '../common/translation-content-search';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeroDto, UpdateHeroDto } from './admin-heroes.dto';

@Injectable()
export class AdminHeroesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  private async buildListWhere(q?: string): Promise<Prisma.HeroWhereInput> {
    const search = q?.trim();
    if (!search) return {};
    const ids = await modelIdsMatchingTranslationContent(
      this.prisma,
      ModelType.Hero,
      search,
    );
    const idNum = Number.parseInt(search, 10);
    const or: Prisma.HeroWhereInput[] = [];
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
    const [total, heroes] = await Promise.all([
      this.prisma.hero.count({ where }),
      this.prisma.hero.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
    ]);
    const data = await Promise.all(heroes.map((h) => this.withTranslations(h)));
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const hero = await this.prisma.hero.findUnique({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero ${id} not found`);
    return this.withTranslations(hero);
  }

  private async withTranslations(hero: {
    id: number;
    video: string | null;
    image: string | null;
  }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.Hero,
      hero.id,
    );
    return { ...hero, translations };
  }

  async create(dto: CreateHeroDto) {
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
      ModelType.Hero,
      dto.translations,
      activeLanguages,
    );
    return this.prisma.$transaction(async (tx) => {
      const hero = await tx.hero.create({
        data: { video: dto.video ?? null, image: dto.image ?? null },
      });
      await this.translations.upsertTranslations(
        tx,
        ModelType.Hero,
        hero.id,
        dto.translations,
        activeLanguages,
      );
      return this.findOne(hero.id);
    });
  }

  async update(id: number, dto: UpdateHeroDto) {
    await this.findOne(id);
    const activeLanguages = await this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, code: true },
    });
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.Hero,
        dto.translations,
        activeLanguages,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.hero.update({
        where: { id },
        data: {
          ...(dto.video !== undefined && { video: dto.video }),
          ...(dto.image !== undefined && { image: dto.image }),
        },
      });
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.Hero,
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
      await this.translations.deleteForModel(tx, ModelType.Hero, id);
      await tx.hero.delete({ where: { id } });
    });
  }
}
