import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { UpdateVehicleDTO } from '../dtos/UpdateVehicleDTO';
import { AuthUser } from '../../../auth-and-access/auth/types/AuthUser';
import ConflictRequest from '../../../errors/ConflictRequest';
import NotFoundRequest from '../../../errors/NotfoundRequest';
import ForbiddenRequest from '../../../errors/ForbiddenRequest';

export class UpdateVehicleUseCase {
  constructor(private repo: IVehicleRepository) {}

  async execute(id: number, user: AuthUser, data: UpdateVehicleDTO) {
    const v = await this.repo.findById(id);

    if (!v) throw new NotFoundRequest(`Vehicle with id ${id} not found`);

    if (!user.roles.includes('admin') && v.ownerId !== user.id) {
      throw new ForbiddenRequest('Forbidden');
    }

    if (data.idPlate && data.idPlate !== v.idPlate) {
      const plateOwner = await this.repo.findByIdPlate(data.idPlate, false);
      if (plateOwner && plateOwner.id !== id) {
        throw new ConflictRequest('idPlate already in use');
      }
    }

    v.update(data as any);
    return this.repo.update(v);
  }
}
