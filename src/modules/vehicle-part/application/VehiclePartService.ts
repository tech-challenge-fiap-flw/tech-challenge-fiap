import { NotFoundServerException } from '../../../shared/application/ServerException';
import { VehiclePartEntity, VehiclePartProps } from '../domain/VehiclePart';
import { VehiclePartRepository } from '../domain/VehiclePartRepository';

export type CreateVehiclePartInput = Omit<VehiclePartProps, 'id' | 'deletedAt' | 'creationDate'>;
export type VehiclePartOutput = ReturnType<VehiclePartEntity['toJSON']>;

export interface IVehiclePartService {
  createVehiclePart(input: CreateVehiclePartInput): Promise<VehiclePartOutput>;
  updateVehiclePart(id: number, partial: Partial<CreateVehiclePartInput>): Promise<VehiclePartOutput>;
  deleteVehiclePart(id: number): Promise<void>;
  findById(id: number): Promise<VehiclePartOutput>;
  list(offset: number, limit: number): Promise<VehiclePartOutput[]>;
  countAll(): Promise<number>;
}

export class VehiclePartService implements IVehiclePartService {
  constructor(private readonly repo: VehiclePartRepository) {}

  async createVehiclePart(input: CreateVehiclePartInput): Promise<VehiclePartOutput> {
    const entity = VehiclePartEntity.create(input);
    const created = await this.repo.create(entity);
    return created.toJSON();
  }

  async updateVehiclePart(id: number, partial: Partial<CreateVehiclePartInput>): Promise<VehiclePartOutput> {
    const updated = await this.repo.update(id, partial);

    if (!updated) {
      throw new NotFoundServerException('Vehicle part not found');
    }

    return updated.toJSON();
  }

  async deleteVehiclePart(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  async findById(id: number): Promise<VehiclePartOutput> {
    const vehiclePart = await this.repo.findById(id);

    if (!vehiclePart) {
      throw new NotFoundServerException('Vehicle part not found');
    }

    return vehiclePart.toJSON();
  }

  async list(offset: number, limit: number): Promise<VehiclePartOutput[]> {
    const items = await this.repo.list(offset, limit);
    return items.map(i => i.toJSON());
  }

  async countAll(): Promise<number> {
    return this.repo.countAll();
  }
}
