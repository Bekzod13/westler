import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { COMPANY_SINGLETON_ID, ModelType } from '../admin.constants';
import { TranslationService } from '../translation/translation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompanyDto } from './admin-companies.dto';

/** PATCH may send `null` to clear optional strings — never call `.trim()` on null. */
function nullIfEmptyTrimmed(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t === '' ? null : t;
}

@Injectable()
export class AdminCompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translations: TranslationService,
  ) {}

  async getSingleton() {
    const row = await this.prisma.company.findUnique({
      where: { id: COMPANY_SINGLETON_ID },
    });
    if (!row) {
      throw new NotFoundException(
        `Company ${COMPANY_SINGLETON_ID} is not configured; run DB seed`,
      );
    }
    return this.withTranslations(row);
  }

  private async withTranslations(company: {
    id: number;
    image: string;
    openedYear: number | null;
    elements: Prisma.JsonValue | null;
    chatId: string | null;
    botToken: string | null;
  }) {
    const translations = await this.translations.loadGroupedByModel(
      ModelType.Company,
      company.id,
    );
    return { ...company, translations };
  }

  async update(dto: UpdateCompanyDto) {
    const row = await this.prisma.company.findUnique({
      where: { id: COMPANY_SINGLETON_ID },
    });
    if (!row) {
      throw new NotFoundException(
        `Company ${COMPANY_SINGLETON_ID} is not configured; run DB seed`,
      );
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
    if (dto.translations !== undefined) {
      this.translations.validateTranslationsPayload(
        ModelType.Company,
        dto.translations,
        activeLanguages,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.company.update({
        where: { id: COMPANY_SINGLETON_ID },
        data: {
          ...(dto.image !== undefined && { image: dto.image }),
          ...(dto.openedYear !== undefined && { openedYear: dto.openedYear }),
          ...(dto.elements !== undefined && {
            elements: dto.elements as Prisma.InputJsonValue,
          }),
          ...(dto.chatId !== undefined && {
            chatId: nullIfEmptyTrimmed(dto.chatId),
          }),
          ...(dto.botToken !== undefined && {
            botToken: nullIfEmptyTrimmed(dto.botToken),
          }),
        },
      });
      if (dto.translations !== undefined) {
        await this.translations.upsertTranslations(
          tx,
          ModelType.Company,
          COMPANY_SINGLETON_ID,
          dto.translations,
          activeLanguages,
        );
      }
      return this.getSingleton();
    });
  }

}
