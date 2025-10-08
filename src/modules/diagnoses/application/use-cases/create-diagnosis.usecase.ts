import { Diagnosis } from '../../domain/entities/diagnosis';
import { DiagnosisRepositoryPort } from '../../domain/repositories/diagnosis.repository.port';
import { VehicleRepositoryPort } from '../../../vehicles/domain/repositories/vehicle.repository.port';
import { UserRepositoryPort } from '../../../users/domain/repositories/user.repository.port';

type Input = {
  description: string;
  vehicleId: number;
  responsibleMechanicId?: number;
};

export class CreateDiagnosisUseCase {
  constructor(
    private diagnoses: DiagnosisRepositoryPort,
    private vehicles: VehicleRepositoryPort,
    private users: UserRepositoryPort
  ) {}

  async execute(input: Input): Promise<Diagnosis> {
    const vehicle = await this.vehicles.findById(input.vehicleId);

    if (!vehicle) {
      const err: any = new Error(`Vehicle with id ${input.vehicleId} not found`);
      err.status = 404;
      throw err;
    }

    let mechanicId: number | null = null;

    if (input.responsibleMechanicId !== undefined) {
      const user = await this.users.findById(input.responsibleMechanicId);

      if (!user) {
        const err: any = new Error(`User with id ${input.responsibleMechanicId} not found`);
        err.status = 404;
        throw err;
      }

      mechanicId = input.responsibleMechanicId;
    }

    return this.diagnoses.create({
      description: input.description,
      vehicleId: input.vehicleId,
      responsibleMechanicId: mechanicId,
      creationDate: new Date()
    });
  }
}
