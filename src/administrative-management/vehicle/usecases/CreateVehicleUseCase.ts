import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { CreateVehicleDTO } from '../dtos/CreateVehicleDTO';
import { Vehicle } from '../domain/Vehicle';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../../errors/AppError';

export class CreateVehicleUseCase {
  constructor(private vehicleRepo: IVehicleRepository) {}

  async execute(dto: CreateVehicleDTO): Promise<Vehicle> {
    // validações simples (SRP: validação aqui)
    if (!dto.plate) throw new AppError('Plate is required', 400);
    if (!dto.type) throw new AppError('Type is required', 400);

    const exists = await this.vehicleRepo.findByPlate(dto.plate);
    if (exists) throw new AppError('Vehicle with this plate already exists', 409);

    const vehicle = new Vehicle({
      id: uuidv4(),
      plate: dto.plate,
      type: dto.type,
      model: dto.model,
      brand: dto.brand,
      manufacture_year: dto.manufacture_year,
      model_year: dto.model_year,
      color: dto.color,
      owner: dto.owner,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.vehicleRepo.create(vehicle);
  }
}
