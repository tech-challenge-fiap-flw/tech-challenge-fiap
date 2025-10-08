import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../domain/entities/vehicle-part';

type Input = Partial<{
  type: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}>;

export class UpdateVehiclePartUseCase {
  constructor(
    private repo: VehiclePartRepositoryPort,
    private ensureExists: (id: number) => Promise<VehiclePart>
  ) {}

  async execute(id: number, data: Input): Promise<VehiclePart> {
    await this.ensureExists(id);
    return this.repo.update(id, data);
  }
}
