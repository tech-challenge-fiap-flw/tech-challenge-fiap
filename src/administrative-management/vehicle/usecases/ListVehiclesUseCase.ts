import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';
import { AuthUser } from '../../../auth-and-access/auth/types/AuthUser';

export class ListVehiclesUseCase {
  constructor(private repo: IVehicleRepository) {}

  async execute(user: AuthUser): Promise<Vehicle[]> {
    const all = await this.repo.findAll(false);

    if (user.roles.includes('admin')) {
      return all;
    }

    return all.filter(v => v.ownerId === user.id);
  }
}