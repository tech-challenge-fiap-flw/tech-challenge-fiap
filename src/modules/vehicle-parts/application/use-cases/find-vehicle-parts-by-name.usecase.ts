import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../domain/entities/vehicle-part';

export class FindVehiclePartsByNameUseCase {
  constructor(private repo: VehiclePartRepositoryPort) {}

  async execute(name: string): Promise<VehiclePart[]> {
    return this.repo.findByNameLike(name);
  }
}
