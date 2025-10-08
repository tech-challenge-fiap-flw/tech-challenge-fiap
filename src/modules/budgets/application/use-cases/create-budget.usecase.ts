import { VehicleServiceRepositoryPort } from '../../../../modules/vehicle-services/domain/repositories/vehicle-service.repository.port';
import { DiagnosisRepositoryPort } from '../../../../modules/diagnoses/domain/repositories/diagnosis.repository.port';
import { UserRepositoryPort } from '../../../../modules/users/domain/repositories/user.repository.port';
import { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { VehiclePartRepositoryPort } from '../../../../modules/vehicle-parts/domain/repositories/vehicle-part.repository.port';

// import {
//   UsersQueryPort,
//   DiagnosisQueryPort,
//   VehiclePartStockPort,
//   VehicleServiceQueryPort,
//   // BudgetVehiclePartPort,
//   // BudgetVehicleServicePort
// } from '../../domain/ports/external-services.ports';

type Input = {
  description: string;
  ownerId: number;
  diagnosisId: number;
  vehicleParts: { id: number; quantity: number }[];
  vehicleServicesIds: number[];
};

export class CreateBudgetUseCase {
  constructor(
    private budgetRepository: BudgetRepositoryPort,
    private usersRepository: UserRepositoryPort,
    private diagnosisRepositoryPort: DiagnosisRepositoryPort,
    private vehicleServiceRepositoryPort: VehicleServiceRepositoryPort,
    private vehiclePartRepositoryPort: VehiclePartRepositoryPort
    // private diagnosis: DiagnosisQueryPort,
    // private parts: VehiclePartStockPort,
    // private services: VehicleServiceQueryPort,
    // private bvp: BudgetVehiclePartPort,
    // private bvs: BudgetVehicleServicePort,
    // private withTransaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
  ) {}

  async execute(input: Input) {
      await this.usersRepository.findById(input.ownerId);
      await this.diagnosisRepositoryPort.findById(input.diagnosisId);

      const vehicleServices = await this.vehicleServiceRepositoryPort.findByIds(input.vehicleServicesIds);

      if (vehicleServices.length !== (input.vehicleServicesIds?.length || 0)) {
        const err: any = new Error('Um ou mais serviços não foram encontrados');
        err.status = 404;
        throw err;
      }

      let totalParts = 0;
      for (const p of input.vehicleParts) {
        const part = await this.vehiclePartRepositoryPort.findById(p.id);

        if (part.quantity < p.quantity) {
          const err: any = new Error(`Insufficient quantity for vehicle part with id ${p.id}`);
          err.status = 403;
          throw err;
        }

        totalParts += part.price * p.quantity;
        await this.vehiclePartRepositoryPort.update(part.id, { quantity: part.quantity - p.quantity });
      }

      const totalServices = vehicleServices.reduce((sum, vs) => sum + vs.price, 0);

      const budget = await this.budgetRepository.create({
        description: input.description,
        ownerId: input.ownerId,
        diagnosisId: input.diagnosisId,
        vehicleParts: input.vehicleParts,
        vehicleServicesIds: input.vehicleServicesIds,
        total: totalParts + totalServices
      });


      // await this.budgetVehiclePartService.create({ budgetId: savedBudget.id, vehicleParts }, manager);

      // await this.budgetVehicleServicesService.create({
      //   budgetId: savedBudget.id,
      //   vehicleServices: vehicleServices.map(vs => vs.id)
      // }, manager);
  }
}
