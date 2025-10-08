import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../domain/entities/vehicle-part';

type Input = {
  type: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
};

export class CreateVehiclePartUseCase {
  constructor(private repo: VehiclePartRepositoryPort) {}

  async execute(input: Input): Promise<VehiclePart> {
    return this.repo.create({
      type: input.type,
      name: input.name,
      description: input.description,
      quantity: input.quantity,
      price: input.price
    });
  }
}
