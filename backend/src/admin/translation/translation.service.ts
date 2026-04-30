import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, type Language } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModelType, ModelTypeValue, TRANSLATION_FIELDS } from '../admin.constants';

const GROUP_FIELD_KEY = /^[a-zA-Z0-9_.-]{1,128}$/;

@Injectable()
export class TranslationService {
  constructor(private readonly prisma: PrismaService) {}

  validateTranslationsPayload(
    modelType: ModelTypeValue,
    translationsByCode: Record<string, Record<string, string>>,
    activeLanguages: Pick<Language, 'id' | 'code'>[],
  ): void {
    if (modelType === ModelType.Group) {
      this.validateGroupTranslationsPayload(translationsByCode, activeLanguages);
      return;
    }

    const requiredFields = TRANSLATION_FIELDS[modelType];
    const codes = new Set(activeLanguages.map((l) => l.code));
    for (const code of codes) {
      const row = translationsByCode[code];
      if (!row || typeof row !== 'object') {
        throw new BadRequestException(
          `Missing translations for language code "${code}"`,
        );
      }
      for (const f of requiredFields) {
        const v = row[f];
        if (typeof v !== 'string' || v.trim() === '') {
          throw new BadRequestException(
            `Field "${f}" is required for language "${code}"`,
          );
        }
      }
      for (const k of Object.keys(row)) {
        if (!requiredFields.includes(k)) {
          throw new BadRequestException(
            `Unknown translation field "${k}" for ${modelType}`,
          );
        }
      }
    }
    for (const code of Object.keys(translationsByCode)) {
      if (!codes.has(code)) {
        throw new BadRequestException(
          `Unknown or inactive language code "${code}"`,
        );
      }
    }
  }

  private validateGroupTranslationsPayload(
    translationsByCode: Record<string, Record<string, string>>,
    activeLanguages: Pick<Language, 'id' | 'code'>[],
  ): void {
    const codes = new Set(activeLanguages.map((l) => l.code));
    const orderedCodes = activeLanguages.map((l) => l.code);
    const first = orderedCodes[0];
    if (!first) {
      throw new BadRequestException('No active languages configured');
    }

    for (const code of codes) {
      const row = translationsByCode[code];
      if (!row || typeof row !== 'object') {
        throw new BadRequestException(
          `Missing translations for language code "${code}"`,
        );
      }
    }
    for (const code of Object.keys(translationsByCode)) {
      if (!codes.has(code)) {
        throw new BadRequestException(
          `Unknown or inactive language code "${code}"`,
        );
      }
    }

    const keySet = new Set(Object.keys(translationsByCode[first]!));
    for (const code of orderedCodes) {
      const row = translationsByCode[code]!;
      const keys = Object.keys(row);
      if (keys.length !== keySet.size) {
        throw new BadRequestException(
          `Group translation keys must match every language; mismatch for "${code}"`,
        );
      }
      for (const k of keys) {
        if (!keySet.has(k)) {
          throw new BadRequestException(
            `Group translation keys must match every language; mismatch for "${code}"`,
          );
        }
      }
      for (const k of keys) {
        if (!GROUP_FIELD_KEY.test(k)) {
          throw new BadRequestException(
            `Invalid group field key "${k}" (use letters, digits, _, -, .; max 128 chars)`,
          );
        }
        const v = row[k];
        if (typeof v !== 'string') {
          throw new BadRequestException(
            `Field "${k}" must be a string for language "${code}"`,
          );
        }
      }
    }
  }

  async upsertTranslations(
    tx: Pick<Prisma.TransactionClient, 'translation'>,
    modelType: ModelTypeValue,
    modelId: number,
    translationsByCode: Record<string, Record<string, string>>,
    activeLanguages: Pick<Language, 'id' | 'code'>[],
  ): Promise<void> {
    if (modelType === ModelType.Group) {
      await this.upsertGroupTranslations(
        tx,
        modelId,
        translationsByCode,
        activeLanguages,
      );
      return;
    }

    const codeToId = new Map(activeLanguages.map((l) => [l.code, l.id]));
    const requiredFields = TRANSLATION_FIELDS[modelType];

    for (const [code, fields] of Object.entries(translationsByCode)) {
      const languageId = codeToId.get(code);
      if (languageId === undefined) continue;

      for (const field of requiredFields) {
        const content = fields[field];
        await tx.translation.upsert({
          where: {
            modelId_modelType_field_languageId: {
              modelId,
              modelType,
              field,
              languageId,
            },
          },
          create: {
            languageId,
            modelId,
            modelType,
            field,
            content,
          },
          update: { content },
        });
      }
    }
  }

  private async upsertGroupTranslations(
    tx: Pick<Prisma.TransactionClient, 'translation'>,
    modelId: number,
    translationsByCode: Record<string, Record<string, string>>,
    activeLanguages: Pick<Language, 'id' | 'code'>[],
  ): Promise<void> {
    const codeToId = new Map(activeLanguages.map((l) => [l.code, l.id]));
    const firstCode = activeLanguages[0]?.code;
    if (!firstCode) return;

    const keys = Object.keys(translationsByCode[firstCode] ?? {});

    await tx.translation.deleteMany({
      where: {
        modelId,
        modelType: ModelType.Group,
        ...(keys.length > 0 ? { field: { notIn: keys } } : {}),
      },
    });

    for (const [code, fields] of Object.entries(translationsByCode)) {
      const languageId = codeToId.get(code);
      if (languageId === undefined) continue;

      for (const field of keys) {
        const content = fields[field] ?? '';
        await tx.translation.upsert({
          where: {
            modelId_modelType_field_languageId: {
              modelId,
              modelType: ModelType.Group,
              field,
              languageId,
            },
          },
          create: {
            languageId,
            modelId,
            modelType: ModelType.Group,
            field,
            content,
          },
          update: { content },
        });
      }
    }
  }

  async deleteForModel(
    tx: Pick<Prisma.TransactionClient, 'translation'>,
    modelType: ModelTypeValue,
    modelId: number,
  ): Promise<void> {
    await tx.translation.deleteMany({
      where: { modelId, modelType },
    });
  }

  async loadGroupedByModel(
    modelType: ModelTypeValue,
    modelId: number,
  ): Promise<Record<string, Record<string, string>>> {
    const rows = await this.prisma.translation.findMany({
      where: { modelId, modelType },
      include: { language: { select: { code: true } } },
    });
    const out: Record<string, Record<string, string>> = {};
    for (const r of rows) {
      const code = r.language.code;
      if (!out[code]) out[code] = {};
      out[code][r.field] = r.content;
    }
    return out;
  }
}
