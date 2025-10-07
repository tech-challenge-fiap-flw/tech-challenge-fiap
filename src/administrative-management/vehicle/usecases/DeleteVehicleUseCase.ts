import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { AppError } from '../../../errors/AppError';

export class DeleteVehicleUseCase {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) throw new AppError('Vehicle not found', 404);
    await this.vehicleRepo.delete(id);
  }
}
