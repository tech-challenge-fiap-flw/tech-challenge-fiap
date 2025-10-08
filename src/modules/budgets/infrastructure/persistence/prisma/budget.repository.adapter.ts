import { prisma } from '../../../../../shared/prisma/client';
import { BudgetRepositoryPort } from '../../../domain/ports/budget.repository.port';
import { Budget } from '../../../domain/entities/budget';

export class PrismaBudgetRepository implements BudgetRepositoryPort {
  async create(data: {
    description: string;
    ownerId: number;
    diagnosisId: number;
    vehicleParts: { id: number; quantity: number }[];
    vehicleServicesIds: number[];
    total: number;
  }): Promise<number> {
    const created = await prisma.budget.create({
      data: {
        description: data.description,
        ownerId: data.ownerId,
        diagnosisId: data.diagnosisId,
        total: data.total
      },
      select: { id: true }
    });
    return created.id;
  }

  async findById(id: number, withParts: boolean, user?: { id: number; roles?: string[] }): Promise<Budget | null> {
    const where = (user?.roles?.includes('admin') || !user)
      ? { id, deletedAt: null }
      : { id, ownerId: user!.id, deletedAt: null };

    const row = await prisma.budget.findFirst({
      where,
      include: {
        vehicleParts: withParts,
      }
    });
    return row ? this.map(row, withParts) : null;
  }

  async updateCore(id: number, data: { description?: string }): Promise<void> {
    await prisma.budget.update({
      where: { id },
      data: { description: data.description ?? undefined }
    });
  }

  async softDelete(id: number): Promise<void> {
    await prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  private map(row: any, withParts: boolean): Budget {
    const parts = withParts
      ? (row.vehicleParts ?? []).map((vp: any) => ({ id: vp.vehiclePartId, quantity: vp.quantity }))
      : [];
    return new Budget(
      row.id,
      row.description,
      row.deletedAt ?? null,
      row.creationDate,
      row.ownerId,
      row.diagnosisId,
      row.total ?? 0,
      parts
    );
  }
}
