import { VehicleRepositoryPort } from '../../domain/repositories/vehicle.repository.port';
import { Vehicle } from '../../domain/entities/vehicle';

type AuthUser = { id: number; roles?: string[] };

export class FindVehicleByIdUseCase {
  constructor(private repo: VehicleRepositoryPort) {}

  async execute(id: number, user?: AuthUser): Promise<Vehicle> {
    const isAdmin = !!user && (user.roles || []).includes('admin');
    const result = await this.repo.findById(id, user && !isAdmin ? { ownerId: user.id } : {});

    if (!result) {
      const err: any = new Error(`Vehicle with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    return result;
  }
}
