import { prisma } from '../../../../../shared/prisma/client';
import { VehicleServiceRepositoryPort } from '../../../domain/repositories/vehicle-service.repository.port';
import { VehicleServiceEntity } from '../../../domain/entities/vehicle-service';

export class PrismaVehicleServiceRepository implements VehicleServiceRepositoryPort {
  private map(row: any): VehicleServiceEntity {
    return new VehicleServiceEntity(
      row.id,
      row.name,
      row.price,
      row.description ?? null,
      row.deletedAt ?? null
    );
  }

  async create(data: Omit<VehicleServiceEntity, 'id' | 'deletedAt'>): Promise<VehicleServiceEntity> {
    const created = await prisma.vehicleService.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description ?? null
      }
    });
    return this.map(created);
  }

  async findAll(): Promise<VehicleServiceEntity[]> {
    const rows = await prisma.vehicleService.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'desc' }
    });
    return rows.map(this.map);
  }

  async findById(id: number): Promise<VehicleServiceEntity | null> {
    const row = await prisma.vehicleService.findFirst({
      where: { id, deletedAt: null }
    });
    return row ? this.map(row) : null;
  }

  async update(id: number, data: Partial<Omit<VehicleServiceEntity, 'id' | 'deletedAt'>>): Promise<VehicleServiceEntity> {
    const updated = await prisma.vehicleService.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        price: data.price ?? undefined,
        description: data.description === undefined ? undefined : data.description
      }
    });
    return this.map(updated);
  }

  async softDelete(id: number): Promise<void> {
    await prisma.vehicleService.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async findByIds(ids: number[]): Promise<VehicleServiceEntity[]> {
    const rows = await prisma.vehicleService.findMany({
      where: { id: { in: ids }, deletedAt: null }
    });
    return rows.map(this.map);
  }
}
