import { BadRequestException } from '@nestjs/common';

export const MAX_ADMIN_PER_PAGE = 100;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  perPage: number;
};

export function parsePaginationQuery(
  pageRaw?: string,
  perPageRaw?: string,
): { page: number; perPage: number } {
  const page =
    pageRaw === undefined || pageRaw === ''
      ? 1
      : Number.parseInt(pageRaw, 10);
  const perPage =
    perPageRaw === undefined || perPageRaw === ''
      ? 15
      : Number.parseInt(perPageRaw, 10);
  if (Number.isNaN(page) || page < 1) {
    throw new BadRequestException('page must be a positive integer');
  }
  if (
    Number.isNaN(perPage) ||
    perPage < 1 ||
    perPage > MAX_ADMIN_PER_PAGE
  ) {
    throw new BadRequestException(
      `perPage must be between 1 and ${MAX_ADMIN_PER_PAGE}`,
    );
  }
  return { page, perPage };
}

export function paginationArgs(page: number, perPage: number) {
  const take = perPage;
  const skip = (page - 1) * take;
  return { take, skip };
}
