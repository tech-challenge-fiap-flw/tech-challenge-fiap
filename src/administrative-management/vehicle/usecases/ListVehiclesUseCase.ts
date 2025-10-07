import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';

export class ListVehiclesUseCase {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    return this.vehicleRepo.findAll();
  }
}
