import { VehiclePartRepositoryPort } from '../../domain/repositories/vehicle-part.repository.port';
import { VehiclePart } from '../../domain/entities/vehicle-part';

export class FindVehiclePartByIdUseCase {
  constructor(private repo: VehiclePartRepositoryPort) {}

  async execute(id: number): Promise<VehiclePart> {
    const part = await this.repo.findById(id);

    if (!part) {
      const err: any = new Error(`Vehicle Part with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    return part;
  }
}
