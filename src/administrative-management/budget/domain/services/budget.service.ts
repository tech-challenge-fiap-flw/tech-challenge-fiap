import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateBudgetDto } from '../../presentation/dto/create-budget.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { Budget } from '../entities/budget.entity';
import { DataSource, EntityManager } from 'typeorm';
import { DiagnosisService } from 'src/administrative-management/diagnosis/domain/services/diagnosis.service';
import { UpdateBudgetDto } from '../../presentation/dto/update-budget.dto';
import { BudgetVehiclePartService } from 'src/administrative-management/budget-vehicle-part/domain/services/budget-vehicle-part.service';
import { BaseService } from '../../../../shared/domain/services/base-service.service';
import { UpdateBudgetVehiclePartDto } from 'src/administrative-management/budget-vehicle-part/presentation/dto/update-budget-vehicle-part.dto';
import { RemoveBudgetVehiclePartDto } from 'src/administrative-management/budget-vehicle-part/presentation/dto/remove-budget-vehicle-part.dto';
import { CreateBudgetVehiclePartDto } from 'src/administrative-management/budget-vehicle-part/presentation/dto/create-budget-vehicle-part.dto';
import { UserService } from 'src/auth-and-access/user/domain/services/user.service';
import { User } from 'src/auth-and-access/user/domain/entities/user.entity';
import { ServiceOrder } from 'src/administrative-management/service-order/domain/entities/service-order.entity';
import { ServiceOrderStatus } from 'src/administrative-management/service-order/domain/enum/service-order-status.enum';
import { ServiceOrderHistoryService } from 'src/administrative-management/service-order-history/domain/services/service-order-history.service';
import { VehiclePartService } from 'src/administrative-management/vehicle-part/domain/services/vehicle-part.service';
import { VehicleServiceService } from '../../../vehicle-service/domain/services/vehicle-service.service';
import { BudgetVehicleServicesService } from 'src/administrative-management/budget-vehicle-services/domain/services/budget-vehicle-services.service';

@Injectable()
export class BudgetService extends BaseService<Budget> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource, 

    private readonly userService: UserService,
    private readonly diagnosisService: DiagnosisService,
    private readonly vehiclePartService: VehiclePartService,
    private readonly budgetVehiclePartService: BudgetVehiclePartService,
    private readonly vehicleServiceService: VehicleServiceService, 
    private readonly historyService: ServiceOrderHistoryService,
    private readonly budgetVehicleServicesService: BudgetVehicleServicesService,
  ) {
    super(dataSource, Budget);
  }

  private async executeCreate(createDto: CreateBudgetDto, manager: EntityManager): Promise<number> {
    await this.userService.findById(createDto.ownerId);
    await this.diagnosisService.findById(createDto.diagnosisId, manager);

    const { vehicleParts, vehicleServicesIds, ...rest } = createDto;

    const vehicleServices = await this.vehicleServiceService.findByIds(vehicleServicesIds || []);
    if (vehicleServices.length !== (vehicleServicesIds?.length || 0)) {
      throw new NotFoundException('Um ou mais serviços não foram encontrados');
    }

    const savedBudget = await manager.getRepository(Budget).save(rest);
    await this.budgetVehiclePartService.create({ budgetId: savedBudget.id, vehicleParts }, manager);

    await this.budgetVehicleServicesService.create({
      budgetId: savedBudget.id,
      vehicleServices: vehicleServices.map(vs => vs.id)
    }, manager);

    for (const part of vehicleParts) {
      const vehiclePart = await this.vehiclePartService.findOne(part.id);

      if (vehiclePart.quantity < part.quantity) {
        throw new ForbiddenException(`Insufficient quantity for vehicle part with id ${part.id}`);
      }

      vehiclePart.quantity -= part.quantity;

      await this.vehiclePartService.updatePart(vehiclePart.id, { quantity: vehiclePart.quantity }, manager);
    }

    return savedBudget.id;
  }

  async create(createDto: CreateBudgetDto, manager?: EntityManager): Promise<Budget> {
    const response = await this.transactional(async (manager) => {
      const savedBudgetId = manager
        ? await this.executeCreate(createDto, manager)
        : await this.runInTransaction((manager) => this.executeCreate(createDto, manager));

        return await this.findById(savedBudgetId, ['vehicleParts'], manager);
    }, manager);

    return response;
  }

  async findById(id: number, relations: Array<string> = [], manager?: EntityManager): Promise<Budget> {
    const budget = await this.getCurrentRepository(manager).findOne({
      where: { id },
      relations,
    });

    if (!budget) {
      throw new NotFoundException(`Budget with id ${id} not found`);
    }

    return budget;
  }

  async update(id: number, updateDto: UpdateBudgetDto): Promise<Budget> {
    await this.runInTransaction(async (manager) => {
      const budget = await manager.getRepository(Budget).findOne({
        where: { id },
        relations: ['vehicleParts'],
      });

      if (!budget) {
        throw new NotFoundException(`Budget with id ${id} not found`);
      }

      const { vehicleParts, vehicleServicesIds, ...rest } = updateDto;
      const currentVehicleParts = budget.vehicleParts || [];

      const dtoMap = new Map(vehicleParts.map(item => [item.id, item.quantity]));
      const currentMap = new Map(currentVehicleParts.map(item => [item.vehiclePartId, { id: item.id, quantity: item.quantity }]));

      const toRemove: RemoveBudgetVehiclePartDto[] = [];
      const toUpdate: UpdateBudgetVehiclePartDto[] = [];
      const toAdd: CreateBudgetVehiclePartDto = { budgetId: id, vehicleParts: [] };

      if (vehicleServicesIds) {
        const vehicleServices = await this.vehicleServiceService.findByIds(vehicleServicesIds);
        if (vehicleServices.length !== vehicleServicesIds.length) {
          throw new NotFoundException('Um ou mais serviços não foram encontrados para atualização');
        }

        await manager.createQueryBuilder()
          .relation(Budget, 'vehicleServices')
          .of(budget)
          .addAndRemove(vehicleServices, budget.vehicleServices);
      }

      for (const [vehiclePartId, currentItem] of currentMap.entries()) {
        if (!dtoMap.has(vehiclePartId)) {
          toRemove.push({ id: currentItem.id });
        } else {
          const newQuantity = dtoMap.get(vehiclePartId);
          if (currentItem.quantity !== newQuantity) {
            toUpdate.push({ id: currentItem.id, vehiclePartId, quantity: newQuantity });
          }
        }
      }

      for (const item of vehicleParts) {
        if (!currentMap.has(item.id)) {
          toAdd.vehicleParts.push({ id: item.id, quantity: item.quantity })
        }
      }

      Object.assign(budget, rest);
      await manager.getRepository(Budget).save(budget);

      if (toRemove.length) {
        const idsToRemove = toRemove.map(p => ({ id: p.id }));
        await this.budgetVehiclePartService.remove(idsToRemove, manager);
      }

      if (toUpdate.length) {
        await this.budgetVehiclePartService.updateMany(toUpdate, manager);
      }

      if (toAdd.vehicleParts.length) {
        await this.budgetVehiclePartService.create(toAdd, manager);
      }
    });

    return this.findById(id, ['vehicleParts']);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findById(id, ['vehicleParts']);

    const vehiclePartIds = customer.vehicleParts.map(vehiclePart => ({ id: vehiclePart.id }))
    await this.budgetVehiclePartService.remove(vehiclePartIds)

    await this.repository.softRemove(customer);
  }

  async decideBudget(budgetId: number, accept: boolean, user: User): Promise<ServiceOrder> {
    return this.runInTransaction(async (manager) => {
      const budget = await manager.getRepository(Budget).findOne({
        where: { id: budgetId },
        relations: ['owner'],
      });
  
      if (!budget) {
        throw new NotFoundException('Orçamento não encontrado.');
      }
  
      if (budget.ownerId !== user.id) {
        throw new ForbiddenException('Você não está autorizado a decidir esse orçamento.');
      }
  
      const order = await manager.getRepository(ServiceOrder).findOne({
        where: { budget: { id: budgetId }, active: true },
        relations: ['customer'],
      });
  
      if (!order) {
        throw new NotFoundException('Ordem de serviço relacionada não encontrada.');
      }
  
      if (order.customer.id !== user.id) {
        throw new ForbiddenException('Você não está autorizado a modificar essa OS.');
      }
  
      const oldStatus = order.currentStatus;
      const newStatus = accept
        ? ServiceOrderStatus.AGUARDANDO_INICIO
        : ServiceOrderStatus.RECUSADA;
  
      order.currentStatus = newStatus;
  
      const savedOrder = await manager.getRepository(ServiceOrder).save(order);

      if (!accept) {
      
        const vehiclePartIds = await this.budgetVehiclePartService.findByBudgetId(budget.id, manager);

        for (const part of vehiclePartIds) {
          const vehiclePart = await this.vehiclePartService.findOne(part.vehiclePartId);
          vehiclePart.quantity += part.quantity;
          await this.vehiclePartService.updatePart(vehiclePart.id, { quantity: vehiclePart.quantity }, manager);
        }
      }
  
      await this.historyService.logStatusChange(
        savedOrder.idServiceOrder,
        user.id,
        oldStatus,
        newStatus,
      );
  
      return savedOrder;
    });
  }  
}
