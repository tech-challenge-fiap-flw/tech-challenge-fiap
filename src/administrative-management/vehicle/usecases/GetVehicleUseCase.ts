import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';
import NotFoundRequest from '../../../errors/NotFoundRequest';
import ForbiddenRequest from '../../../errors/ForbiddenRequest';
import { AuthUser } from '../../../auth-and-access/auth/types/AuthUser';

export class GetVehicleUseCase {
  constructor(private repo: IVehicleRepository) {}

  async execute(id: number, user: AuthUser): Promise<Vehicle> {
    const v = await this.repo.findById(id);

    if (!v) {
      throw new NotFoundRequest(`Vehicle with id ${id} not found`);
    }

    if (!user.roles.includes('admin') && v.ownerId !== user.id) {
      throw new ForbiddenRequest('Forbidden');
    }

    return v;
  }
}