import { ServiceOrderEntity } from '../domain/ServiceOrder';
import { IServiceOrderRepository } from '../domain/IServiceOrderRepository';
import { AuthPayload } from '../../../modules/auth/AuthMiddleware';
import { IDiagnosisService } from '../../../modules/diagnosis/application/DiagnosisService';
import { IBudgetService, VehiclePartQuantity } from '../../../modules/budget/application/BudgetService';
import { BadRequestServerException, NotFoundServerException } from '../../../shared/application/ServerException';
import { ServiceOrderStatus } from '../../../shared/ServiceOrderStatus';
import { IBudgetVehiclePartService } from '../../../modules/budget-vehicle-part/application/BudgetVehiclePartService';
import { IVehiclePartService } from '../../../modules/vehicle-part/application/VehiclePartService';

export type CreateServiceOrderInput = {
  description: string;
  vehicleId: number;
  vehicleParts?: Array<{
    vehiclePartId: number;
    quantity: number;
  }>;
  vehicleServicesIds?: number[];
};

export type CreateServiceOrderOutput = ReturnType<ServiceOrderEntity['toJSON']>;

export type AcceptServiceOrderInput = {
  accept: boolean;
};

export interface IServiceOrderService {
  create(user: AuthPayload, input: CreateServiceOrderInput): Promise<CreateServiceOrderOutput>;
  accept(mechanic: AuthPayload, id: number, input: AcceptServiceOrderInput): Promise<CreateServiceOrderOutput>;
}

export class ServiceOrderService implements IServiceOrderService {
  constructor(
    private readonly repo: IServiceOrderRepository,
    private readonly diagnosisService: IDiagnosisService,
    private readonly budgetService: IBudgetService,
    private readonly budgetVehiclePartService: IBudgetVehiclePartService,
    private readonly vehiclePartService: IVehiclePartService,
  ) {}

  async findById(id: number): Promise<CreateServiceOrderOutput> {
    const serviceOrder = await this.repo.findById(id);

    if (!serviceOrder) {
      throw new NotFoundServerException('Service Order not found');
    }

    return serviceOrder.toJSON();
  }

  async create(user: AuthPayload, input: CreateServiceOrderInput): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const isAutoDiagnosis = input.vehicleServicesIds?.length && input.vehicleServicesIds?.length;

      let budgetId = null;

      if (isAutoDiagnosis) {
        const diagnosis = await this.diagnosisService.create({
          description: 'Diagnóstico automático',
          vehicleId: input.vehicleId,
          mechanicId: undefined,
        });

        const budget = await this.budgetService.create({
          ownerId: user.sub,
          diagnosisId: Number(diagnosis.id),
          description: 'Orçamento para diagnóstico automático',
          vehicleParts: input.vehicleParts as VehiclePartQuantity[],
          vehicleServicesIds: input.vehicleServicesIds,
        });

        budgetId = budget.id;
      }

      const serviceOrderEntity = ServiceOrderEntity.create({
        description: isAutoDiagnosis ? 'Ordem de Serviço - Diagnóstico Automático' : input.description,
        budgetId: budgetId,
        customerId: user.sub,
        vehicleId: input.vehicleId,
      });

      const serviceOrderCreated = await this.repo.create(serviceOrderEntity);

      return serviceOrderCreated.toJSON();
    });
  }

  async accept(mechanic: AuthPayload, id: number, input: AcceptServiceOrderInput): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const order = await this.findById(id);

      if (order.mechanicId) {
        throw new BadRequestServerException('Essa OS já foi aceita ou recusada por outro mecânico.');
      }

      const oldStatus = order.currentStatus;

      if (input.accept) {
        const newStatus = order.budgetId
          ? ServiceOrderStatus.AGUARDANDO_INICIO
          : ServiceOrderStatus.EM_DIAGNOSTICO;

        this.repo.update(id, {
          mechanicId: mechanic.sub,
          currentStatus: newStatus,
        });
      } else {
        if (order.budgetId) {
          const vehiclePartIds = await this.budgetVehiclePartService.listByBudget(order.budgetId);
  
          for (const part of vehiclePartIds) {
            const vehiclePart = await this.vehiclePartService.findById(part.vehiclePartId);
            vehiclePart.quantity += part.quantity;
            await this.vehiclePartService.updateVehiclePart(Number(vehiclePart.id), { quantity: vehiclePart.quantity });
          }
        }
        
        this.repo.update(id, {
          mechanicId: mechanic.sub,
          currentStatus: ServiceOrderStatus.RECUSADA,
        });
      }

      return order;
    });
  }
}
