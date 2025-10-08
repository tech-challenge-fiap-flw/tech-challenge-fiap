import { VehicleRepositoryPort } from '../../domain/repositories/vehicle.repository.port';
import { Vehicle } from '../../domain/entities/vehicle';

type AuthUser = { id: number; roles?: string[] };

export class FindAllVehiclesUseCase {
  constructor(private repo: VehicleRepositoryPort) {}

  async execute(user: AuthUser): Promise<Vehicle[]> {
    const isAdmin = (user.roles || []).includes('admin');
    return this.repo.findAll(isAdmin ? {} : { ownerId: user.id });
  }
}
