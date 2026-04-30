import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ModelType } from '../admin.constants';
import {
  PaginatedResult,
  paginationArgs,
} from '../common/admin-pagination';
import { modelIdsMatchingTranslationContent } from '../common/translation-content-search';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './admin-groups.dto';

@Injectable()
export class AdminGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  private async buildListWhere(q?: string): Promise<Prisma.GroupWhereInput> {
    const search = q?.trim();
    if (!search) return {};
    const ids = await modelIdsMatchingTranslationContent(
      this.prisma,
      ModelType.Group,
      search,
    );
    const idNum = Number.parseInt(search, 10);
    const or: Prisma.GroupWhereInput[] = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
    if (ids.length > 0) or.push({ id: { in: ids } });
    if (!Number.isNaN(idNum) && String(idNum) === search) {
      or.push({ id: idNum });
    }
    return { OR: or };
  }

  async findAll(
    page: number,
    perPage: number,
    q?: string,
  ): Promise<
    PaginatedResult<{
      id: number;
      name: string;
      slug: string;
      description: string | null;
      translationCount: number;
      itemCount: number;
      translations: Record<string, Record<string, string>>;
    }>
  > {
    const { take, skip } = paginationArgs(page, perPage);
    const where = await this.buildListWhere(q);
    const [total, rows] = await Promise.all([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
    ]);
    const data = await Promise.all(rows.map((g) => this.withTranslations(g)));
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const row = await this.prisma.group.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!row) throw new NotFoundException(`Group ${id} not found`);
    return this.withTranslationsAndItems(row);
  }

  private async withTranslations(group: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.Group,
      group.id,
    );
    const [translationCount, itemCount] = await Promise.all([
      this.prisma.translation.count({
        where: { modelType: ModelType.Group, modelId: group.id },
      }),
      this.prisma.groupItem.count({ where: { groupId: group.id } }),
    ]);
    return { ...group, translations, translationCount, itemCount };
  }

  private async withTranslationsAndItems(row: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    items: Array<{ id: number; groupId: number; sortOrder: number }>;
  }) {
    const base = await this.withTranslations(row);
    const items = await Promise.all(
      row.items.map(async (it) => {
        const translations = await this.translations.loadGroupedByModel(
          ModelType.GroupItem,
          it.id,
        );
        return { ...it, translations };
      }),
    );
    return { ...base, items };
  }

  async create(dto: CreateGroupDto) {
    const existing = await this.prisma.group.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Group slug "${dto.slug}" is already in use`);
    }
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
      ModelType.Group,
      dto.translations,
      activeLanguages,
    );
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description ?? null,
        },
      });
      await this.translations.upsertTranslations(
        tx,
        ModelType.Group,
        group.id,
        dto.translations,
        activeLanguages,
      );
      return this.findOne(group.id);
    });
  }

  async update(id: number, dto: UpdateGroupDto) {
    await this.findOne(id);
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
    if (dto.slug !== undefined) {
      const clash = await this.prisma.group.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`Group slug "${dto.slug}" is already in use`);
      }
    }
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.Group,
        dto.translations,
        activeLanguages,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      if (dto.name !== undefined || dto.slug !== undefined || dto.description !== undefined) {
        await tx.group.update({
          where: { id },
          data: {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
            ...(dto.description !== undefined
              ? { description: dto.description }
              : {}),
          },
        });
      }
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.Group,
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
      const items = await tx.groupItem.findMany({ where: { groupId: id } });
      for (const it of items) {
        await this.translations.deleteForModel(tx, ModelType.GroupItem, it.id);
      }
      await this.translations.deleteForModel(tx, ModelType.Group, id);
      await tx.group.delete({ where: { id } });
    });
  }
}
