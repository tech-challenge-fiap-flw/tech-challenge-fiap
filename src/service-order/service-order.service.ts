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
import { Budget } from 'src/administrative-management/budget/domain/entities/budget.entity';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
  ) {}

  async create(userData: User, dto: CreateServiceOrderDto): Promise<ServiceOrder> {
    const serviceOrder = this.serviceOrderRepository.create({
      description: dto.description,
      currentStatus: 'Recebida',
      customer: userData,
      vehicle: { id: dto.vehicleId },
      budget: dto.budgetId ? { id: dto.budgetId } : undefined,
    });

    return this.serviceOrderRepository.save(serviceOrder);
  }

  async findOne(id: number): Promise<ServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({
      where: { idServiceOrder: id, active: true },
      relations: ['budget', 'customer', 'mechanic', 'vehicle'],
    });

    if (!order) throw new NotFoundException(`OS ${id} não encontrada`);
    return order;
  }

  async updateStatus(id: number, status: string): Promise<ServiceOrder> {
    const order = await this.findOne(id);
    order.currentStatus = status;
    return this.serviceOrderRepository.save(order);
  }

  async acceptOrder(mechanic: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (order.mechanic) {
      throw new BadRequestException('Essa OS já foi aceita por outro mecânico.');
    }

    order.mechanic = mechanic;
    order.currentStatus = 'Em diagnóstico';

    return this.serviceOrderRepository.save(order);
  }

  async assignBudget(mechanic: User, id: number, budgetId: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);

    if (!order.mechanic || order.mechanic.id !== mechanic.id) {
      throw new ForbiddenException('Você não está autorizado a atribuir um orçamento a esta OS.');
    }

    if (order.budget) {
      throw new BadRequestException('Essa OS já possui um orçamento atribuído.');
    }

    const budget = await this.serviceOrderRepository.manager.findOne(Budget, {
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado.');
    }

    order.budget = budget;
    order.currentStatus = 'Aguardando aprovação';
    return this.serviceOrderRepository.save(order);
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
  
    if (order.currentStatus !== 'Aguardando início') {
      throw new BadRequestException('A OS precisa estar com status "Aguardando início" para começar o reparo.');
    }
  
    order.currentStatus = 'Em execução';
    return this.serviceOrderRepository.save(order);
  }
  
  async finishRepair(mechanic: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);
  
    if (!order.mechanic || order.mechanic.id !== mechanic.id) {
      throw new ForbiddenException('Você não está autorizado a finalizar este serviço.');
    }
  
    if (order.currentStatus !== 'Em execução') {
      throw new BadRequestException('A OS precisa estar "Em execução" para ser finalizada.');
    }
  
    order.currentStatus = 'Finalizada';
    return this.serviceOrderRepository.save(order);
  }
  
  async delivered(customer: User, id: number): Promise<ServiceOrder> {
    const order = await this.findOne(id);
  
    if (order.customer.id !== customer.id) {
      throw new ForbiddenException('Você não está autorizado a confirmar a entrega deste serviço.');
    }
  
    if (!order.vehicle) {
      throw new NotFoundException('Veículo não encontrado para esta OS.');
    }

    order.currentStatus = 'Entregue';
    return this.serviceOrderRepository.save(order);
  }

}
