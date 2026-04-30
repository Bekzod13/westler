import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginationArgs } from '../common/admin-pagination';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, perPage: number, q?: string) {
    const { take, skip } = paginationArgs(page, perPage);
    const search = q?.trim();
    const where: Prisma.OrderWhereInput | undefined = search
      ? {
          OR: [
            { fullName: { contains: search } },
            { companyName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
            { message: { contains: search } },
          ],
        }
      : undefined;

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return { data, total, page, perPage: take };
  }

  async remove(id: number) {
    const row = await this.prisma.order.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Order ${id} not found`);
    await this.prisma.order.delete({ where: { id } });
  }
}
