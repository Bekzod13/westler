import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  PaginatedResult,
  paginationArgs,
} from '../common/admin-pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLanguageDto, UpdateLanguageDto } from './admin-languages.dto';

@Injectable()
export class AdminLanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    perPage: number,
    q?: string,
  ): Promise<PaginatedResult<{ id: number; name: string; code: string; isDefault: boolean; isActive: boolean }>> {
    const { take, skip } = paginationArgs(page, perPage);
    const where: Prisma.LanguageWhereInput = {};
    const search = q?.trim();
    if (search) {
      const or: Prisma.LanguageWhereInput[] = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
      const idNum = Number.parseInt(search, 10);
      if (!Number.isNaN(idNum) && String(idNum) === search) {
        or.push({ id: idNum });
      }
      where.OR = or;
    }
    const [total, data] = await Promise.all([
      this.prisma.language.count({ where }),
      this.prisma.language.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
    ]);
    return { data, total, page, perPage: take };
  }

  async findOne(id: number) {
    const row = await this.prisma.language.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Language ${id} not found`);
    return row;
  }

  async create(dto: CreateLanguageDto) {
    const isDefault = dto.isDefault ?? false;
    const isActive = dto.isActive ?? true;
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (isDefault) {
          await tx.language.updateMany({ data: { isDefault: false } });
        }
        return tx.language.create({
          data: {
            name: dto.name,
            code: dto.code,
            isDefault,
            isActive,
          },
        });
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Language code already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateLanguageDto) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault === true) {
          await tx.language.updateMany({ data: { isDefault: false } });
        }
        return tx.language.update({
          where: { id },
          data: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.code !== undefined && { code: dto.code }),
            ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
            ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          },
        });
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Language code already exists');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.language.delete({ where: { id } });
  }
}
