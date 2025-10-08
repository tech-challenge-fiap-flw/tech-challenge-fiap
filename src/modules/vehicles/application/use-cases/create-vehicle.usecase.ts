import { VehicleRepositoryPort } from '../../domain/repositories/vehicle.repository.port';
import { Vehicle } from '../../domain/entities/vehicle';

type Input = {
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId?: number;
};

type AuthUser = { id: number; roles?: string[] };

export class CreateVehicleUseCase {
  constructor(private repo: VehicleRepositoryPort) {}

  async execute(user: AuthUser, data: Input): Promise<Vehicle> {
    const isAdmin = (user.roles || []).includes('admin');

    const already = await this.repo.existsByIdPlate(data.idPlate);
    if (already) {
      const err: any = new Error('Vehicle with this plate already exists');
      err.status = 400;
      throw err;
    }

    const ownerId = isAdmin ? (data.ownerId ?? user.id) : user.id;

    return this.repo.create({
      idPlate: data.idPlate,
      type: data.type,
      model: data.model,
      brand: data.brand,
      manufactureYear: data.manufactureYear,
      modelYear: data.modelYear,
      color: data.color,
      ownerId
    });
  }
}
