import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';
import { VehicleServiceEntity } from '../../domain/entities/vehicle-service';

export class FindVehicleServiceByIdUseCase {
  constructor(private repo: VehicleServiceRepositoryPort) {}

  async execute(id: number): Promise<VehicleServiceEntity> {
    const item = await this.repo.findById(id);

    if (!item) {
      const err: any = new Error(`VehicleService #${id} not found`);
      err.status = 404;
      throw err;
    }

    return item;
  }
}
