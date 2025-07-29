import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from '../../presentation/dto/create-budget.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Budget } from '../entities/budget.entity';
import { DataSource, Repository } from 'typeorm';
import { CustomerService } from '../../../../administrative-management/customer/domain/services/customer.service';
import { DiagnosisService } from '../../../../administrative-management/diagnosis/domain/services/diagnosis.service';
import { UpdateBudgetDto } from '../../presentation/dto/update-budget.dto';
import { BudgetVehiclePartService } from '../../../../administrative-management/budget-vehicle-part/domain/services/budget-vehicle-part.service';
import { BaseService } from '../../../../shared/domain/services/base-service.service';
import { UpdateBudgetVehiclePartDto } from '../../../../administrative-management/budget-vehicle-part/presentation/dto/update-budget-vehicle-part.dto';
import { RemoveBudgetVehiclePartDto } from '../../../../administrative-management/budget-vehicle-part/presentation/dto/remove-budget-vehicle-part.dto';
import { CreateBudgetVehiclePartDto } from '../../../../administrative-management/budget-vehicle-part/presentation/dto/create-budget-vehicle-part.dto';

@Injectable()
export class BudgetService extends BaseService {
  constructor(
    @InjectDataSource()
    dataSource: DataSource, 

    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    private readonly customerService: CustomerService,
    private readonly diagnosisService: DiagnosisService,
    private readonly budgetVehiclePartService: BudgetVehiclePartService,
  ) {
    super(dataSource); 
  }

  async create(createDto: CreateBudgetDto): Promise<Budget> {
    const savedBudgetId = await this.runInTransaction(async (manager) => {
      await this.customerService.findById(createDto.ownerId)
      await this.diagnosisService.findById(createDto.diagnosisId)

      const { vehicleParts, ...rest } = createDto;

      const savedBudget = await manager.getRepository(Budget).save(rest);
      await this.budgetVehiclePartService.create({ budgetId: savedBudget.id, vehicleParts }, manager)

      return savedBudget.id;
    });

    return this.findById(savedBudgetId, ['vehicleParts']);
  }

  async findById(id: number, relations: Array<string> = []): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations,
    });

    if (!budget) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
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

      const { vehicleParts, ...rest } = updateDto;
      const currentVehicleParts = budget.vehicleParts || [];

      const dtoMap = new Map(vehicleParts.map(item => [item.id, item.quantity]));
      const currentMap = new Map(currentVehicleParts.map(item => [item.vehiclePartId, { id: item.id, quantity: item.quantity }]));

      const toRemove: RemoveBudgetVehiclePartDto[] = [];
      const toUpdate: UpdateBudgetVehiclePartDto[] = [];
      const toAdd: CreateBudgetVehiclePartDto = { budgetId: id, vehicleParts: [] };

      // Determina itens a remover e atualizar
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

      // Determina itens a adicionar
      for (const item of vehicleParts) {
        if (!currentMap.has(item.id)) {
          toAdd.vehicleParts.push({ id: item.id, quantity: item.quantity })
        }
      }

      // Atualiza o orçamento em si
      Object.assign(budget, rest);
      await manager.getRepository(Budget).save(budget);

      // Aplica operações específicas
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

    await this.budgetRepository.softRemove(customer);
  }
}
