import { VehicleEntity, IVehicleProps } from '../domain/Vehicle';
import { IVehicleRepository } from '../domain/IVehicleRepository';
import { IUserService } from '../../../modules/user/application/UserService';
import { BadRequestServerException, NotFoundServerException } from '../../../shared/application/ServerException';

export type CreateVehicleInput = Omit<IVehicleProps, 'id' | 'deletedAt'>;
export type VehicleOutput = ReturnType<VehicleEntity['toJSON']>;

export interface IVehicleService {
  createVehicle(input: CreateVehicleInput): Promise<VehicleOutput>;
  updateVehicle(id: number, partial: Partial<CreateVehicleInput>): Promise<VehicleOutput | null>;
  deleteVehicle(id: number): Promise<void>;
  findById(id: number): Promise<VehicleOutput>;
  list(offset: number, limit: number): Promise<VehicleOutput[]>;
  countAll(): Promise<number>;
}

export class VehicleService implements IVehicleService {
  constructor(
    private readonly repo: IVehicleRepository,
    private readonly userService: IUserService
  ) {}

  async createVehicle(input: CreateVehicleInput): Promise<VehicleOutput> {
    const exists = await this.repo.findByIdPlate(input.idPlate);

    if (exists) {
      throw new BadRequestServerException('Plate already exists');
    }

    await this.userService.findById(input.ownerId);

    const entity = VehicleEntity.create(input);
    const created = await this.repo.create(entity);
    return created.toJSON();
  }

  async updateVehicle(id: number, partial: Partial<CreateVehicleInput>): Promise<VehicleOutput | null> {
    const updated = await this.repo.update(id, partial);

    if (!updated) {
      throw new NotFoundServerException('Vehicle not found');
    }

    return updated.toJSON();
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  async findById(id: number): Promise<VehicleOutput> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new NotFoundServerException('Vehicle not found');
    }

    return found.toJSON();
  }

  async list(offset: number, limit: number): Promise<VehicleOutput[]> {
    const items = await this.repo.list(offset, limit);
    return items.map(i => i.toJSON());
  }

  async countAll(): Promise<number> {
    return this.repo.countAll();
  }
}
