import { VehicleRepositoryPort } from '../../domain/repositories/vehicle.repository.port';

type AuthUser = { id: number; roles?: string[] };
type Input = Partial<{
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
}>;

export class UpdateVehicleUseCase {
  constructor(
    private repo: VehicleRepositoryPort,
    private findById: (id: number, user?: AuthUser) => Promise<any>
  ) {}

  async execute(user: AuthUser, id: number, data: Input) {

    await this.findById(id, user);

    if (data.idPlate) {
      const exists = await this.repo.existsByIdPlate(data.idPlate);

      if (exists) {
        const err: any = new Error('Vehicle with this plate already exists');
        err.status = 400;
        throw err;
      }
    }
    return this.repo.update(id, data);
  }
}
