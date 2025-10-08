import { IVehicleRepository } from '../repositories/IVehicleRepository';
import NotFoundRequest from '../../../errors/NotFoundRequest';
import { AuthUser } from '../../../auth-and-access/auth/types/AuthUser';
import ForbiddenRequest from '../../../errors/ForbiddenRequest';

export class DeleteVehicleUseCase {
  constructor(private repo: IVehicleRepository) {}

  async execute(id: number, user: AuthUser): Promise<void> {
    const v = await this.repo.findById(id);

    if (!v) throw new NotFoundRequest(`Vehicle with id ${id} not found`);

    if (!user.roles.includes('admin') && v.ownerId !== user.id) {
      throw new ForbiddenRequest('Forbidden');
    }

    await this.repo.softDelete(id);
  }
}
