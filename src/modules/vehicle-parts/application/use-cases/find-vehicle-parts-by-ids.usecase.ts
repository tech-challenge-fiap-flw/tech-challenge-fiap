import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../domain/entities/vehicle-part';

export class FindVehiclePartsByIdsUseCase {
  constructor(private repo: VehiclePartRepositoryPort) {}

  async execute(ids: number[]): Promise<VehiclePart[]> {
    return this.repo.findByIds(ids);
  }
}
