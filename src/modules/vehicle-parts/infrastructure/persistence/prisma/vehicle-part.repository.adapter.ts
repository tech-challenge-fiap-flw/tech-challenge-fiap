import { prisma } from '../../../../../shared/prisma/client';
import { VehiclePartRepositoryPort } from '../../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../../domain/entities/vehicle-part';

export class PrismaVehiclePartRepository implements VehiclePartRepositoryPort {
  private map(row: any): VehiclePart {
    return new VehiclePart(
      row.id,
      row.type,
      row.name,
      row.description,
      row.quantity,
      row.price,
      row.deletedAt ?? null,
      row.creationDate
    );
  }

  async create(data: Omit<VehiclePart, 'id' | 'deletedAt' | 'creationDate'>): Promise<VehiclePart> {
    const created = await prisma.vehiclePart.create({
      data: {
        type: data.type,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        price: data.price
      }
    });
    return this.map(created);
  }

  async findById(id: number): Promise<VehiclePart | null> {
    const row = await prisma.vehiclePart.findFirst({
      where: { id, deletedAt: null }
    });
    return row ? this.map(row) : null;
  }

  async findByNameLike(name: string): Promise<VehiclePart[]> {
    const rows = await prisma.vehiclePart.findMany({
      where: {
        deletedAt: null,
        name: { contains: name }
      },
      orderBy: { id: 'desc' }
    });

    return rows.map(this.map);
  }

  async findByIds(ids: number[]): Promise<VehiclePart[]> {
    const rows = await prisma.vehiclePart.findMany({
      where: {
        deletedAt: null,
        id: { in: ids }
      }
    });
    return rows.map(this.map);
  }

  async update(id: number, data: Partial<Omit<VehiclePart, 'id' | 'creationDate' | 'deletedAt'>>): Promise<VehiclePart> {
    const updated = await prisma.vehiclePart.update({
      where: { id },
      data: {
        type: data.type ?? undefined,
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        quantity: data.quantity ?? undefined,
        price: data.price ?? undefined
      }
    });
    return this.map(updated);
  }

  async softDelete(id: number): Promise<void> {
    await prisma.vehiclePart.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
