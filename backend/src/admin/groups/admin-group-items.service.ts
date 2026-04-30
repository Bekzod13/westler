import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '../admin.constants';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupItemDto, UpdateGroupItemDto } from './admin-group-items.dto';

@Injectable()
export class AdminGroupItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  private async assertGroup(groupId: number) {
    const g = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!g) throw new NotFoundException(`Group ${groupId} not found`);
    return g;
  }

  async findAll(groupId: number) {
    await this.assertGroup(groupId);
    const rows = await this.prisma.groupItem.findMany({
      where: { groupId },
      orderBy: { sortOrder: 'asc' },
    });
    return Promise.all(rows.map((r) => this.withTranslations(r)));
  }

  async findOne(groupId: number, itemId: number) {
    await this.assertGroup(groupId);
    const row = await this.prisma.groupItem.findFirst({
      where: { id: itemId, groupId },
    });
    if (!row) {
      throw new NotFoundException(`Group item ${itemId} not found in group ${groupId}`);
    }
    return this.withTranslations(row);
  }

  private async withTranslations(item: {
    id: number;
    groupId: number;
    sortOrder: number;
  }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.GroupItem,
      item.id,
    );
    return { ...item, translations };
  }

  async create(groupId: number, dto: CreateGroupItemDto) {
    await this.assertGroup(groupId);
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
      ModelType.GroupItem,
      dto.translations,
      activeLanguages,
    );
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.groupItem.create({
        data: {
          groupId,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
      await this.translations.upsertTranslations(
        tx,
        ModelType.GroupItem,
        item.id,
        dto.translations,
        activeLanguages,
      );
      return this.findOne(groupId, item.id);
    });
  }

  async update(groupId: number, itemId: number, dto: UpdateGroupItemDto) {
    await this.findOne(groupId, itemId);
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
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.GroupItem,
        dto.translations,
        activeLanguages,
      );
    }
    return this.prisma.$transaction(async (tx) => {
      if (dto.sortOrder !== undefined) {
        await tx.groupItem.update({
          where: { id: itemId },
          data: { sortOrder: dto.sortOrder },
        });
      }
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.GroupItem,
          itemId,
          dto.translations,
          activeLanguages,
        );
      }
      return this.findOne(groupId, itemId);
    });
  }

  async remove(groupId: number, itemId: number) {
    await this.findOne(groupId, itemId);
    await this.prisma.$transaction(async (tx) => {
      await this.translations.deleteForModel(tx, ModelType.GroupItem, itemId);
      await tx.groupItem.delete({ where: { id: itemId } });
    });
  }
}
