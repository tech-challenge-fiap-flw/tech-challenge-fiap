import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';

export class RemoveVehicleServiceUseCase {
  constructor(
    private repo: VehicleServiceRepositoryPort,
    private ensureExists: (id: number) => Promise<any>
  ) {}

  async execute(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.repo.softDelete(id);
  }
}
