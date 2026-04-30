import { PrismaService } from '../../prisma/prisma.service';

/** Returns distinct modelIds whose translations contain `q` in `content`. */
export async function modelIdsMatchingTranslationContent(
  prisma: PrismaService,
  modelType: string,
  q: string,
): Promise<number[]> {
  const term = q.trim();
  if (!term) return [];
  const rows = await prisma.translation.findMany({
    where: { modelType, content: { contains: term } },
    select: { modelId: true },
  });
  return [...new Set(rows.map((r) => r.modelId))];
}
