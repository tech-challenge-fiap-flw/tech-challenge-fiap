import { prisma } from '../../../../../shared/prisma/client';
import { VehicleRepositoryPort } from '../../../domain/repositories/vehicle.repository.port';
import { Vehicle } from '../../../domain/entities/vehicle';

export class PrismaVehicleRepository implements VehicleRepositoryPort {
  private map(row: any): Vehicle {
    return new Vehicle(
      row.id,
      row.idPlate,
      row.type,
      row.model,
      row.brand,
      row.manufactureYear,
      row.modelYear,
      row.color,
      row.ownerId,
      row.deletedAt
    );
  }

  async create(data: Omit<Vehicle, 'id' | 'deletedAt'>): Promise<Vehicle> {
    const created = await prisma.vehicle.create({
      data: {
        idPlate: data.idPlate,
        type: data.type,
        model: data.model,
        brand: data.brand,
        manufactureYear: data.manufactureYear,
        modelYear: data.modelYear,
        color: data.color,
        ownerId: data.ownerId
      }
    });
    return this.map(created);
  }

  async findAll(where?: Partial<Pick<Vehicle, 'ownerId'>>): Promise<Vehicle[]> {
    const rows = await prisma.vehicle.findMany({
      where: {
        deletedAt: null,
        ...(where?.ownerId ? { ownerId: where.ownerId } : {})
      },
      orderBy: { id: 'desc' }
    });
    return rows.map(this.map);
  }

  async findById(id: number, where?: Partial<Pick<Vehicle, 'ownerId'>>): Promise<Vehicle | null> {
    const row = await prisma.vehicle.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(where?.ownerId ? { ownerId: where.ownerId } : {})
      }
    });
    return row ? this.map(row) : null;
  }

  async update(id: number, data: Partial<Omit<Vehicle, 'id' | 'ownerId'>>): Promise<Vehicle> {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        idPlate: data.idPlate ?? undefined,
        type: data.type ?? undefined,
        model: data.model ?? undefined,
        brand: data.brand ?? undefined,
        manufactureYear: data.manufactureYear ?? undefined,
        modelYear: data.modelYear ?? undefined,
        color: data.color ?? undefined
      }
    });
    return this.map(updated);
  }

  async softDelete(id: number): Promise<void> {
    await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async existsByIdPlate(idPlate: string): Promise<boolean> {
    const found = await prisma.vehicle.findFirst({
      where: { idPlate, deletedAt: null }
    });
    return !!found;
  }
}
