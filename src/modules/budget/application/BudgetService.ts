import { BudgetEntity } from '../domain/Budget';
import { IBudgetRepository } from '../domain/IBudgetRepository';
import { IBudgetVehiclePartService } from '../../budget-vehicle-part/application/BudgetVehiclePartService';
import { IBudgetVehicleServiceService } from '../../budget-vehicle-service/application/BudgetVehicleServiceService';
import { IVehiclePartService } from '../../vehicle-part/application/VehiclePartService';
import { IVehicleServiceService } from '../../vehicle-service/application/VehicleServiceService';
import { ForbiddenServerException, NotFoundServerException } from '../../../shared/application/ServerException';
import { IUserService } from '../../../modules/user/application/UserService';
import { IDiagnosisService } from '../../../modules/diagnosis/application/DiagnosisService';

export type VehiclePartQuantity = {
  vehiclePartId: number;
  quantity: number;
};

export type CreateBudgetInput = {
  description: string;
  ownerId: number;
  diagnosisId: number;
  vehicleParts: VehiclePartQuantity[];
  vehicleServicesIds?: number[];
};

export type UpdateBudgetInput = Partial<Omit<CreateBudgetInput, 'ownerId' | 'diagnosisId'>>;
export type BudgetOutput = ReturnType<BudgetEntity['toJSON']> & { vehicleParts?: { id: number; quantity: number }[] };

export interface IBudgetService {
  create(input: CreateBudgetInput): Promise<BudgetOutput>;
}

export class BudgetService implements IBudgetService {
  constructor(
    private readonly repo: IBudgetRepository,
    private readonly userService: IUserService,
    private readonly diagnosisService: IDiagnosisService,
    private readonly vehiclePartService: IVehiclePartService,
    private readonly budgetVehiclePartService: IBudgetVehiclePartService,
    private readonly vehicleServiceService: IVehicleServiceService,
    private readonly budgetVehicleServiceService: IBudgetVehicleServiceService
  ) {}

  async create(input: CreateBudgetInput): Promise<BudgetOutput> {
    return this.repo.transaction(async () => {
      await this.userService.findById(input.ownerId);

      await this.diagnosisService.findById(input.diagnosisId);

      const vehicleServices = await this.vehicleServiceService.findByIds(input.vehicleServicesIds || []);

      if (vehicleServices.length !== (input.vehicleServicesIds?.length || 0)) {
        throw new NotFoundServerException('Um ou mais serviços não foram encontrados');
      }

      const totalParts = await this.updateVehiclePart(input.vehicleParts);

      const totalServices = vehicleServices.reduce((sum, vs) => sum + vs.price, 0);

      const entity = BudgetEntity.create({
        description: input.description,
        ownerId: input.ownerId,
        diagnosisId: input.diagnosisId,
        total: totalParts + totalServices,
      });

      const created = await this.repo.create(entity);
      const budgetJson = created.toJSON();

      await this.budgetVehiclePartService.createMany({
        budgetId: budgetJson.id,
        parts: input.vehicleParts
      });

      if (vehicleServices.length !== (input.vehicleServicesIds?.length || 0)) {
        throw new NotFoundServerException('Um ou mais serviços não foram encontrados');
      }

      if (input.vehicleServicesIds?.length) {
        await this.budgetVehicleServiceService.createMany({
          budgetId: budgetJson.id,
          vehicleServiceIds: input.vehicleServicesIds
        });
      }

      return budgetJson;
    });
  }

  private async updateVehiclePart(vehicleParts: VehiclePartQuantity[]): Promise<number> {
    let totalParts = 0;

    for (const part of vehicleParts) {
      const vehiclePart = await this.vehiclePartService.findById(part.vehiclePartId);

      if (vehiclePart.quantity < part.quantity) {
        throw new ForbiddenServerException(`Insufficient quantity for vehicle part with id ${part.vehiclePartId}`);
      }

      vehiclePart.quantity -= part.quantity;
      totalParts += vehiclePart.price * part.quantity;

      await this.vehiclePartService.updateVehiclePart(Number(vehiclePart.id), { quantity: vehiclePart.quantity });
    }

    return totalParts;
  }
}
