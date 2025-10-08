import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';
import { VehicleServiceEntity } from '../../domain/entities/vehicle-service';

export class FindAllVehicleServicesUseCase {
  constructor(private repo: VehicleServiceRepositoryPort) {}

  async execute(): Promise<VehicleServiceEntity[]> {
    return this.repo.findAll();
  }
}
