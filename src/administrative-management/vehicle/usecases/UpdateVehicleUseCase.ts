import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { AppError } from '../../../errors/AppError';
import { Vehicle } from '../domain/Vehicle';

export class UpdateVehicleUseCase {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(id: string, data: Partial<Omit<Vehicle, 'id' | 'created_at'>>) {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) throw new AppError('Vehicle not found', 404);

    // evitar colisão de placa com outro veículo
    if (data.plate) {
      const byPlate = await this.vehicleRepo.findByPlate(data.plate);
      if (byPlate && byPlate.id !== id) throw new AppError('Plate already in use', 409);
    }

    existing.update(data);
    return this.vehicleRepo.update(existing);
  }
}
