import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';

export class RemoveVehiclePartUseCase {
  constructor(
    private repo: VehiclePartRepositoryPort,
    private ensureExists: (id: number) => Promise<any>
  ) {}

  async execute(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.repo.softDelete(id);
  }
}
