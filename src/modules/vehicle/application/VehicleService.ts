import { VehicleEntity, VehicleProps } from '../domain/Vehicle';
import { VehicleRepository } from '../domain/VehicleRepository';

export class VehicleService {
  constructor(private readonly repo: VehicleRepository) {}

  async createVehicle(input: Omit<VehicleProps, 'id' | 'deletedAt'>) {
    const exists = await this.repo.findByIdPlate(input.idPlate);

    if (exists) {
      throw Object.assign(new Error('Plate already exists'), { status: 400 });
    }

    const entity = VehicleEntity.create(input);
    const created = await this.repo.create(entity);
    return created.toJSON();
  }

  async updateVehicle(id: number, partial: Partial<VehicleProps>) {
    const updated = await this.repo.update(id, partial);
    return updated.toJSON();
  }

  async deleteVehicle(id: number) {
    await this.repo.softDelete(id);
  }
}
