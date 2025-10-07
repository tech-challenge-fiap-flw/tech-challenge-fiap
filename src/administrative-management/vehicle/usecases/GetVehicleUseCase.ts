import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';
import { AppError } from '../../../errors/AppError';

export class GetVehicleUseCase {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<Vehicle> {
    const v = await this.vehicleRepo.findById(id);
    if (!v) throw new AppError('Vehicle not found', 404);
    return v;
  }
}
