import { ServiceOrderEntity } from '../domain/ServiceOrder';
import { IServiceOrderRepository } from '../domain/IServiceOrderRepository';
import { AuthPayload } from '../../../modules/auth/AuthMiddleware';
import { IDiagnosisService } from '../../../modules/diagnosis/application/DiagnosisService';
import { IBudgetService, VehiclePartQuantity } from '../../../modules/budget/application/BudgetService';
import { BadRequestServerException, ForbiddenServerException, NotFoundServerException } from '../../../shared/application/ServerException';
import { ServiceOrderStatus } from '../../../shared/ServiceOrderStatus';
import { IBudgetVehiclePartService } from '../../../modules/budget-vehicle-part/application/BudgetVehiclePartService';
import { IVehiclePartService } from '../../../modules/vehicle-part/application/VehiclePartService';
import { IServiceOrderHistoryService } from '../../../modules/service-order-history/application/ServiceOrderHistoryService';

export type CreateServiceOrderInput = {
  description: string;
  vehicleId: number;
  budgetId?: number;
  currentStatus?: ServiceOrderStatus;
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

export type AssignBudgetServiceOrderInput = Omit<CreateServiceOrderInput, 'vehicleId'>;

export interface IServiceOrderService {
  create(user: AuthPayload, input: CreateServiceOrderInput): Promise<CreateServiceOrderOutput>;
  findById(id: number, user?: AuthPayload): Promise<CreateServiceOrderOutput>;
  delete(id: number): Promise<void>;
  accept(mechanic: AuthPayload, id: number, input: AcceptServiceOrderInput): Promise<CreateServiceOrderOutput>;
  assignBudget(mechanic: AuthPayload, id: number, input: AssignBudgetServiceOrderInput): Promise<CreateServiceOrderOutput>;
  startRepair(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput>;
  finishRepair(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput>;
  delivered(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput>;
  findActiveByBudgetId(budgetId: number): Promise<CreateServiceOrderOutput | null>;
  update(id: number, partial: Partial<CreateServiceOrderInput>): Promise<CreateServiceOrderOutput | null>;
  decideBudget(customer: AuthPayload, id: number, input: AcceptServiceOrderInput): Promise<CreateServiceOrderOutput>;
  getExecutionTimeById(id: number): Promise<{ executionTimeMs: number }>;
  getAverageExecutionTime(): Promise<{ averageExecutionTimeMs: number }>;
}

export class ServiceOrderService implements IServiceOrderService {
  constructor(
    private readonly repo: IServiceOrderRepository,
    private readonly diagnosisService: IDiagnosisService,
    private readonly budgetService: IBudgetService,
    private readonly budgetVehiclePartService: IBudgetVehiclePartService,
    private readonly vehiclePartService: IVehiclePartService,
    private readonly historyService: IServiceOrderHistoryService
  ) {}

  async findById(id: number, user?: AuthPayload): Promise<CreateServiceOrderOutput> {
    const userId = user ? this.checkUserPermission(user) : undefined;

    const serviceOrder = await this.repo.findById(id, userId);

    if (!serviceOrder) {
      throw new NotFoundServerException('Service Order not found');
    }

    return serviceOrder.toJSON();
  }

  async update(id: number, partial: Partial<CreateServiceOrderInput>): Promise<CreateServiceOrderOutput | null> {
    const serviceOrder = await this.repo.update(id, partial);

    if (!serviceOrder) {
      throw new NotFoundServerException('Service Order not found for update');
    }

    return serviceOrder.toJSON();
  }

  async findActiveByBudgetId(budgetId: number): Promise<CreateServiceOrderOutput | null> {
    const serviceOrder = await this.repo.findActiveByBudgetId(budgetId);

    if (!serviceOrder) {
      throw new NotFoundServerException('Active Service Order not found for the given budget ID');
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
      } else if (input.budgetId) {
        await this.budgetService.findById(input.budgetId);
        budgetId = input.budgetId;
      }

      const serviceOrderEntity = ServiceOrderEntity.create({
        description: isAutoDiagnosis ? 'Ordem de Serviço - Diagnóstico Automático' : input.description,
        budgetId: budgetId,
        customerId: user.sub,
        vehicleId: input.vehicleId,
      });

      const serviceOrderCreatedJson = (await this.repo.create(serviceOrderEntity)).toJSON();

      await this.historyService.logStatusChange({
        idServiceOrder: serviceOrderCreatedJson.id,
        userId: user.sub,
        oldStatus: null,
        newStatus: ServiceOrderStatus.RECEBIDA,
      });

      return serviceOrderCreatedJson;
    });
  }

  async delete(id: number): Promise<void> {
    console.log('Deletando OS com id:', id);
    await this.findById(id);
    await this.repo.softDelete(id);
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

      await this.historyService.logStatusChange({
        idServiceOrder: order.id,
        userId: mechanic.sub,
        oldStatus: oldStatus,
        newStatus: order.currentStatus,
      });

      return order;
    });
  }

  async decideBudget(customer: AuthPayload, id: number, input: AcceptServiceOrderInput): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const budget = await this.budgetService.findById(id);

      if (budget.ownerId !== customer.sub) {
        throw new ForbiddenServerException('Você não está autorizado a decidir esse orçamento.');
      }

      const serviceOrderJson = await this.findActiveByBudgetId(id);

      if (!serviceOrderJson) {
        throw new NotFoundServerException('Service Order related not found');
      }

      if (serviceOrderJson.customerId !== customer.sub) {
        throw new ForbiddenServerException('Você não está autorizado a modificar essa OS.');
      }

      const oldStatus = serviceOrderJson.currentStatus;
      const newStatus = input.accept ? ServiceOrderStatus.AGUARDANDO_INICIO : ServiceOrderStatus.RECUSADA;

      const updatedOrder = await this.update(serviceOrderJson.id, { currentStatus: newStatus });

      if (!updatedOrder) {
        throw new NotFoundServerException('Erro ao atualizar status da OS');
      }

      if (!input.accept && serviceOrderJson.budgetId) {
        const parts = await this.budgetVehiclePartService.listByBudget(serviceOrderJson.budgetId);

        for (const part of parts) {
          const vehiclePart = await this.vehiclePartService.findById(part.vehiclePartId);
          const newQuantity = vehiclePart.quantity + part.quantity;
          await this.vehiclePartService.updateVehiclePart(part.vehiclePartId, { quantity: newQuantity });
        }
      }

      await this.historyService.logStatusChange({
        idServiceOrder: updatedOrder.id,
        userId: customer.sub,
        oldStatus: oldStatus,
        newStatus: newStatus,
      });

      return updatedOrder;
    });
  }

  async assignBudget(mechanic: AuthPayload, id: number, input: AssignBudgetServiceOrderInput): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const order = await this.findById(id);

      if (!order.mechanicId || order.mechanicId !== mechanic.sub) {
        throw new ForbiddenServerException('Você não está autorizado a atribuir um orçamento a esta OS.');
      }

      if (order.budgetId) {
        throw new BadRequestServerException('Essa OS já possui um orçamento atribuído.');
      }

      const oldStatus = order.currentStatus;

      const diagnosis = await this.diagnosisService.create({
        description: input.description,
        vehicleId: order.vehicleId,
        mechanicId: mechanic.sub,
      });

      const budget = await this.budgetService.create({
        description: 'Orçamento para diagnóstico automático',
        vehicleParts: input.vehicleParts as VehiclePartQuantity[],
        diagnosisId: Number(diagnosis.id),
        ownerId: order.customerId,
        vehicleServicesIds: input.vehicleServicesIds,
      });

      const updatedOrder = await this.repo.update(id, {
        budgetId: budget.id,
        currentStatus: ServiceOrderStatus.AGUARDANDO_APROVACAO,
      });

      if (!updatedOrder) {
        throw new NotFoundServerException('Algo deu errado ao atribuir o orçamento.');
      }

      const updatedOrderJson = updatedOrder.toJSON();

      await this.historyService.logStatusChange({
        idServiceOrder: updatedOrderJson.id,
        userId: mechanic.sub,
        oldStatus: oldStatus,
        newStatus: updatedOrderJson.currentStatus,
      });

      return updatedOrderJson;
    });
  }

  async startRepair(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const order = await this.findById(id);

      if (!order.mechanicId || order.mechanicId !== mechanic.sub) {
        throw new ForbiddenServerException('Você não está autorizado a iniciar o reparo desta OS.');
      }

      if (order.currentStatus !== ServiceOrderStatus.AGUARDANDO_INICIO) {
        throw new BadRequestServerException('A OS precisa estar com status "Aguardando início" para começar o reparo.');
      }

      const oldStatus = order.currentStatus;

      const updatedOrder = await this.repo.update(id, {
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
      });

      if (!updatedOrder) {
        throw new NotFoundServerException('Algo deu errado ao iniciar o reparo.');
      }

      const updatedOrderJson = updatedOrder.toJSON();

      await this.historyService.logStatusChange({
        idServiceOrder: updatedOrderJson.id,
        userId: mechanic.sub,
        oldStatus: oldStatus,
        newStatus: updatedOrderJson.currentStatus,
      });

      return updatedOrderJson;
    });
  }

  async finishRepair(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const order = await this.findById(id);

      if (!order.mechanicId || order.mechanicId !== mechanic.sub) {
        throw new ForbiddenServerException('Você não está autorizado a finalizar o reparo desta OS.');
      }

      if (order.currentStatus !== ServiceOrderStatus.EM_EXECUCAO) {
        throw new BadRequestServerException('A OS precisa estar com status "Em execução" para ser finalizada.');
      }

      const oldStatus = order.currentStatus;

      const updatedOrder = await this.repo.update(id, {
        currentStatus: ServiceOrderStatus.FINALIZADA,
      });

      if (!updatedOrder) {
        throw new NotFoundServerException('Algo deu errado ao finalizar o reparo.');
      }

      const updatedOrderJson = updatedOrder.toJSON();

      await this.historyService.logStatusChange({
        idServiceOrder: updatedOrderJson.id,
        userId: mechanic.sub,
        oldStatus: oldStatus,
        newStatus: updatedOrderJson.currentStatus,
      });

      return updatedOrderJson;
    });
  }

  async delivered(mechanic: AuthPayload, id: number): Promise<CreateServiceOrderOutput> {
    return this.repo.transaction(async () => {
      const order = await this.findById(id);

      if (!order.mechanicId || order.mechanicId !== mechanic.sub) {
        throw new ForbiddenServerException('Você não está autorizado a confirmar a entrega desta OS.');
      }

      if (!order.vehicleId) {
        throw new NotFoundServerException('Veículo não encontrado para esta OS.');
      }

      const oldStatus = order.currentStatus;
      
      const updatedOrder = await this.repo.update(id, {
        currentStatus: ServiceOrderStatus.ENTREGUE,
      });

      if (!updatedOrder) {
        throw new NotFoundServerException('Algo deu errado ao confirmar a entrega.');
      }

      const updatedOrderJson = updatedOrder.toJSON();

      await this.historyService.logStatusChange({
        idServiceOrder: updatedOrderJson.id,
        userId: mechanic.sub,
        oldStatus: oldStatus,
        newStatus: updatedOrderJson.currentStatus,
      });

      return updatedOrderJson;
    });
  }

  async getExecutionTimeById(id: number): Promise<{ executionTimeMs: number }> {
    const history = await this.historyService.listByServiceOrder(id);

    if (!history || history.length === 0) {
      throw new BadRequestServerException('Histórico da OS não encontrado.');
    }

    const received = history.find(h => h.newStatus === ServiceOrderStatus.RECEBIDA);
    const finished = history.find(h => h.newStatus === ServiceOrderStatus.FINALIZADA);

    if (!received || !finished) {
      throw new BadRequestServerException('Status RECEBIDA ou FINALIZADA não encontrados para esta OS.');
    }

    const receivedTime = new Date(received.changedAt).getTime();
    const finishedTime = new Date(finished.changedAt).getTime();

    if (finishedTime < receivedTime) {
      throw new BadRequestServerException('Status FINALIZADA ocorreu antes de RECEBIDA (dados inconsistentes).');
    }

    return { executionTimeMs: finishedTime - receivedTime };
  }

  async getAverageExecutionTime(): Promise<{ averageExecutionTimeMs: number }> {
    const serviceOrders = await this.repo.listFinishedOrDelivered();

    if (!serviceOrders || !serviceOrders.length) {
      throw new BadRequestServerException('Nenhuma OS ativa encontrada.');
    }

    const times: number[] = [];

    for (const order of serviceOrders) {
      const orderJson = order.toJSON();
      const timeResult = await this.getExecutionTimeById(orderJson.id);

      times.push(timeResult.executionTimeMs);
    }

    if (times.length === 0) {
      throw new BadRequestServerException('Nenhuma OS possui status RECEBIDA e FINALIZADA para cálculo.');
    }

    const sum = times.reduce((acc, cur) => acc + cur, 0);

    return { averageExecutionTimeMs: sum / times.length };
  }

  private checkUserPermission(user: AuthPayload): number | undefined {
    return user.type !== 'admin' ? user.sub : undefined
  }
}