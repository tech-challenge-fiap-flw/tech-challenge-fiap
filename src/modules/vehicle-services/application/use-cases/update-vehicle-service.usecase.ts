import { VehicleServiceRepositoryPort } from '../../domain/repositories/vehicle-service.repository.port';

type Input = Partial<{ name: string; price: number; description: string | null }>;

export class UpdateVehicleServiceUseCase {
  constructor(
    private repo: VehicleServiceRepositoryPort,
    private ensureExists: (id: number) => Promise<any>
  ) {}

  async execute(id: number, data: Input) {
    await this.ensureExists(id);
    return this.repo.update(id, data);
  }
}
