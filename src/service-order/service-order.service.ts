import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { User } from 'src/auth-and-access/user/domain/entities/user.entity';
import { BudgetService } from 'src/administrative-management/budget/domain/services/budget.service';
import { ServiceOrderStatus } from './enum/service-order-status.enum';
import { ServiceOrderHistoryService } from 'src/service-order-history/service-order-history.service';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
    private budgetService: BudgetService,
    private readonly historyService: ServiceOrderHistoryService,
  ) {}

  async create(userData: User, dto: CreateServiceOrderDto): Promise<ServiceOrder> {
    const serviceOrder = this.serviceOrderRepository.create({
      description: dto.description,
      currentStatus: ServiceOrderStatus.RECEBIDA,
      customer: userData,
      vehicle: { id: dto.vehicleId },
      budget: dto.budgetId ? { id: dto.budgetId } : undefined,
    });

    const savedOrder = await this.serviceOrderRepository.save(serviceOrder);

    await this.historyService.logStatusChange(
      savedOrder.idServiceOrder,
      userData.id,
      null,
      ServiceOrderStatus.RECEBIDA,
    );

    return savedOrder;
  }

  async findOne(id: number): Promise<ServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({
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
  
    const updatedOrder = await this.serviceOrderRepository.save(order);
  
    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      mechanic.id,
      oldStatus,
      updatedOrder.currentStatus,
    );
  
    return updatedOrder;
  }
  

  async assignBudget(mechanic: User, id: number, budgetId: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (!order.mechanic || order.mechanic.id !== mechanic.id) {
      throw new ForbiddenException('Você não está autorizado a atribuir um orçamento a esta OS.');
    }

    if (order.budget) {
      throw new BadRequestException('Essa OS já possui um orçamento atribuído.');
    }

    const budget = await this.budgetService.findById(budgetId);

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado.');
    }

    const oldStatus = order.currentStatus;

    order.budget = budget;
    order.currentStatus = ServiceOrderStatus.AGUARDANDO_APROVACAO;
    const updatedOrder = await this.serviceOrderRepository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      mechanic.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    order.active = false;
    await this.serviceOrderRepository.save(order);
  }

  async findByCustomerEmail(email: string): Promise<ServiceOrder[]> {
    const orders = await this.serviceOrderRepository.find({
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
    const updatedOrder = await this.serviceOrderRepository.save(order);

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
    const updatedOrder = await this.serviceOrderRepository.save(order);

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
    const updatedOrder = await this.serviceOrderRepository.save(order);

    await this.historyService.logStatusChange(
      updatedOrder.idServiceOrder,
      customer.id,
      oldStatus,
      updatedOrder.currentStatus,
    );

    return updatedOrder;
  }
}
