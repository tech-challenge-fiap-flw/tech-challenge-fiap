import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ServiceOrder } from '../entities/service-order.entity';
import { User } from 'src/auth-and-access/user/domain/entities/user.entity';
import { BudgetService } from 'src/administrative-management/budget/domain/services/budget.service';
import { ServiceOrderStatus } from '../enum/service-order-status.enum';
import { ServiceOrderHistoryService } from 'src/service-order-history/service-order-history.service';
import { DiagnosisService } from '../../../diagnosis/domain/services/diagnosis.service';
import { CreateFromAutoDiagnosisDto } from '../../presentation/dto/create-from-auto-diagnosis.dto';
import { CreateBudgetDto } from 'src/administrative-management/budget/presentation/dto/create-budget.dto';
import { BaseService } from '../../../../shared/domain/services/base-service.service';
import { AssignBudgetDto } from '../../presentation/dto/assign-budget.dto';

@Injectable()
export class ServiceOrderService extends BaseService<ServiceOrder> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource, 

    private budgetService: BudgetService,
    private readonly historyService: ServiceOrderHistoryService,
    private readonly diagnosisService: DiagnosisService,
  ) {
    super(dataSource, ServiceOrder);
  }

  async createFromAutoDiagnosis(userData: User, dto: CreateFromAutoDiagnosisDto): Promise<ServiceOrder> {
    return this.runInTransaction(async (manager) => {
      const diagnosis = await this.diagnosisService.create({
        vehicleId: dto.vehicleId,
        responsibleMechanicId: undefined,
        description: dto.description,
      }, manager);

      const budget = await this.budgetService.create({
        ownerId: userData.id,
        diagnosisId: diagnosis.id,
        description: 'Orçamento para diagnóstico automático',
        vehicleParts: dto.vehicleParts,
        vehicleServicesIds: dto.vehicleServicesIds,
      }, manager);

      const serviceOrder = this.repository.create({
        description: 'Ordem de Serviço - Diagnóstico Automático',
        currentStatus: ServiceOrderStatus.RECEBIDA,
        customer: userData,
        vehicle: { id: dto.vehicleId },
        budget: { id: budget.id },
      });

      const savedOrder = await manager.getRepository(ServiceOrder).save(serviceOrder);

      await this.historyService.logStatusChange(
        savedOrder.idServiceOrder,
        userData.id,
        null,
        ServiceOrderStatus.RECEBIDA,
      );

      return savedOrder;
    });
  }

  async findOne(id: number, manager?: EntityManager): Promise<ServiceOrder> {
    const order = await this.getCurrentRepository(manager).findOne({
      where: { idServiceOrder: id, active: true },
      relations: ['budget', 'customer', 'mechanic', 'vehicle'],
    });

    if (!order) throw new NotFoundException(`OS ${id} não encontrada`);
    return order;
  }

  async acceptOrder(mechanic: User, id: number, accept: boolean): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (order.mechanic) {
      throw new BadRequestException('Essa OS já foi aceita ou recusada por outro mecânico.');
    }

    const oldStatus = order.currentStatus;

    if (accept) {
      order.mechanic = mechanic;
      order.currentStatus = ServiceOrderStatus.EM_DIAGNOSTICO;
    } else {
      order.currentStatus = ServiceOrderStatus.RECUSADA;
    }

    const updatedOrder = await this.repository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      mechanic.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }

  async assignBudget(mechanic: User, id: number, assignBudgetDto: AssignBudgetDto): Promise<ServiceOrder> {
    return this.runInTransaction(async (manager) => {
      const order = await manager.getRepository(ServiceOrder).findOne({
        where: { idServiceOrder: id, active: true },
        relations: ['mechanic', 'budget', 'vehicle', 'customer'],
      });

      if (!order) {
        throw new NotFoundException(`OS ${id} não encontrada`);
      }

      if (!order.mechanic || order.mechanic.id !== mechanic.id) {
        throw new ForbiddenException('Você não está autorizado a atribuir um orçamento a esta OS.');
      }

      if (order.budget) {
        throw new BadRequestException('Essa OS já possui um orçamento atribuído.');
      }

      const oldStatus = order.currentStatus;

      // Criar diagnóstico usando manager
      const diagnosis = await this.diagnosisService.create({
        description: assignBudgetDto.description,
        vehicleId: order.vehicle.id,
        responsibleMechanicId: mechanic.id,
      }, manager);

      // Criar orçamento usando manager
      const budget = await this.budgetService.create({
        description: 'Orçamento para diagnóstico automático',
        vehicleParts: assignBudgetDto.vehicleParts,
        diagnosisId: diagnosis.id,
        ownerId: order.customer.id,
        vehicleServicesIds: assignBudgetDto.vehicleServicesIds,
      }, manager);

      // Atualizar a OS com orçamento e status
      order.budget = budget;
      order.currentStatus = ServiceOrderStatus.AGUARDANDO_APROVACAO;

      const updatedOrder = await manager.getRepository(ServiceOrder).save(order);

      await this.historyService.logStatusChange(
        updatedOrder.idServiceOrder,
        mechanic.id,
        oldStatus,
        updatedOrder.currentStatus,
      );

      return updatedOrder;
    });
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    order.active = false;
    await this.repository.save(order);
  }

  async findByCustomerEmail(email: string): Promise<ServiceOrder[]> {
    const orders = await this.repository.find({
      where: { customer: { email }, active: true },
      relations: ['budget', 'customer', 'mechanic', 'vehicle'],
    });

    if (!orders.length) {
      throw new NotFoundException(`Nenhuma OS encontrada para o email: ${email}`);
    }

    return orders;
  }

  async startRepair(mechanic: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (!order.mechanic || order.mechanic.id !== mechanic.id) {
      throw new ForbiddenException('Você não está autorizado a iniciar este serviço.');
    }

    if (order.currentStatus !== ServiceOrderStatus.AGUARDANDO_INICIO) {
      throw new BadRequestException('A OS precisa estar com status "Aguardando início" para começar o reparo.');
    }

    const oldStatus = order.currentStatus;

    order.currentStatus = ServiceOrderStatus.EM_EXECUCAO;
    const updatedOrder = await this.repository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      mechanic.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }

  async finishRepair(mechanic: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (!order.mechanic || order.mechanic.id !== mechanic.id) {
      throw new ForbiddenException('Você não está autorizado a finalizar este serviço.');
    }

    if (order.currentStatus !== ServiceOrderStatus.EM_EXECUCAO) {
      throw new BadRequestException('A OS precisa estar "Em execução" para ser finalizada.');
    }

    const oldStatus = order.currentStatus;

    order.currentStatus = ServiceOrderStatus.FINALIZADA;
    const updatedOrder = await this.repository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      mechanic.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }

  async delivered(customer: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (order.customer.id !== customer.id) {
      throw new ForbiddenException('Você não está autorizado a confirmar a entrega deste serviço.');
    }

    if (!order.vehicle) {
      throw new NotFoundException('Veículo não encontrado para esta OS.');
    }

    const oldStatus = order.currentStatus;

    order.currentStatus = ServiceOrderStatus.ENTREGUE;
    const updatedOrder = await this.repository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      customer.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }
}
