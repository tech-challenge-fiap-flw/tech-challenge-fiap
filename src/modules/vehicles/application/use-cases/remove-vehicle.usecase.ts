import { VehicleRepositoryPort } from '../../domain/repositories/vehicle.repository.port';

type AuthUser = { id: number; roles?: string[] };

export class RemoveVehicleUseCase {
  constructor(
    private repo: VehicleRepositoryPort,
    private findById: (id: number, user?: AuthUser) => Promise<any>
  ) {}

  async execute(user: AuthUser, id: number): Promise<void> {
    await this.findById(id, user);
    await this.repo.softDelete(id);
  }
}
