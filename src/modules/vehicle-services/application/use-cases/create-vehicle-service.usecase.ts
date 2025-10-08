import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';
import { VehicleServiceEntity } from '../../domain/entities/vehicle-service';

type Input = { name: string; price: number; description?: string };

export class CreateVehicleServiceUseCase {
  constructor(private repo: VehicleServiceRepositoryPort) {}

  async execute(input: Input): Promise<VehicleServiceEntity> {
    return this.repo.create({
      name: input.name,
      price: input.price,
      description: input.description ?? null,
    });
  }
}
