import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';
import { VehicleServiceEntity } from '../../domain/entities/vehicle-service';

export class FindVehicleServicesByIdsUseCase {
  constructor(private repo: VehicleServiceRepositoryPort) {}

  async execute(ids: number[] | null | undefined): Promise<VehicleServiceEntity[]> {
    if (!ids || ids.length === 0) return [];
    return this.repo.findByIds(ids);
  }
}
