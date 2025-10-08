import { prisma } from './client';

export async function withPrismaTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => fn(tx));
}
