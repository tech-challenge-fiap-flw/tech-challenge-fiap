import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';
import { CreateVehicleDTO, validateCreateVehicleDTO } from '../dtos/CreateVehicleDTO';
import { AuthUser } from '../../../auth-and-access/auth/types/AuthUser';
import ConflictRequest from '../../../errors/ConflictRequest';

export class CreateVehicleUseCase {
  constructor(private repo: IVehicleRepository) {}

  async execute(user: AuthUser, dto: CreateVehicleDTO): Promise<Vehicle> {
    validateCreateVehicleDTO(dto);

    // Checagem de placa única
    const exists = await this.repo.findByIdPlate(dto.idPlate, true);
    if (exists && !exists.deletedAt) {
      throw new ConflictRequest('Vehicle with this idPlate already exists');
    }

    const ownerId = user.roles.includes('admin')
      ? (dto.ownerId ?? user.id)
      : user.id;


    const vehicle = new Vehicle({
      id: this.repo.nextId(),
      idPlate: dto.idPlate,
      type: dto.type,
      model: dto.model,
      brand: dto.brand,
      manufactureYear: dto.manufactureYear,
      modelYear: dto.modelYear,
      color: dto.color,
      ownerId,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.create(vehicle);
  }
}