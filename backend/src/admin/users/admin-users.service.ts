import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  PaginatedResult,
  paginationArgs,
} from '../common/admin-pagination';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './admin-users.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    perPage: number,
    q?: string,
  ): Promise<
    PaginatedResult<{
      id: number;
      name: string;
      login: string;
      lastLoginAt: Date;
    }>
  > {
    const { take, skip } = paginationArgs(page, perPage);
    const where: Prisma.UserWhereInput = {};
    const search = q?.trim();
    if (search) {
      const or: Prisma.UserWhereInput[] = [
        { name: { contains: search } },
        { login: { contains: search } },
      ];
      const idNum = Number.parseInt(search, 10);
      if (!Number.isNaN(idNum) && String(idNum) === search) {
        or.push({ id: idNum });
      }
      where.OR = or;
    }
    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          login: true,
          lastLoginAt: true,
        },
      }),
    ]);
    return { data: rows, total, page, perPage: take };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        login: true,
        lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      const password = await bcrypt.hash(dto.password, SALT_ROUNDS);
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          login: dto.login,
          password,
        },
        select: {
          id: true,
          name: true,
          login: true,
          lastLoginAt: true,
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Login already exists');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: {
      name?: string;
      login?: string;
      password?: string;
    } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.login !== undefined) data.login = dto.login;
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          login: true,
          lastLoginAt: true,
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('Login already exists');
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
