import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetVehiclePartDto } from '../../presentation/dto/create-budget-vehicle-part.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { BudgetVehiclePart } from '../entities/budget-vehicle-part.entity';
import { VehiclePartService } from '../../../../administrative-management/vehicle-part/domain/services/vehicle-part.service';
import { UpdateBudgetVehiclePartDto } from '../../presentation/dto/update-budget-vehicle-part.dto';
import { RemoveBudgetVehiclePartDto } from '../../presentation/dto/remove-budget-vehicle-part.dto';

@Injectable()
export class BudgetVehiclePartService {
  constructor(
    @InjectRepository(BudgetVehiclePart)
    private budgetVehiclePartRepository: Repository<BudgetVehiclePart>,
    private readonly vehiclePartService: VehiclePartService
  ) {}

  async findByBudgetId(budgetId: number, manager?: EntityManager): Promise<BudgetVehiclePart[]> {
    const repository = manager ? manager.getRepository(BudgetVehiclePart) : this.budgetVehiclePartRepository;
    return repository.find({ where: { budgetId } });
  }

  private async validateVehiclePartIds(ids: number[]): Promise<void> {
    const existingVehicleParts = await this.vehiclePartService.findByIds(ids);
    const existingIds = existingVehicleParts.map((vp) => vp.id);

    const invalidIds = ids.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      throw new NotFoundException(
        `Os seguintes VehiclePart IDs não foram encontrados: ${invalidIds.join(', ')}`
      );
    }
  }

  async create({ budgetId, vehicleParts }: CreateBudgetVehiclePartDto,manager?: EntityManager): Promise<BudgetVehiclePart[]> {
    const ids = vehicleParts.map((vp) => vp.id);
    await this.validateVehiclePartIds(ids);

    const vehiclePartRepo = manager ? manager.getRepository(BudgetVehiclePart) : this.budgetVehiclePartRepository;

    const budgetVehicleParts = vehicleParts.map((vehiclePart) =>
      vehiclePartRepo.create({
        budgetId,
        vehiclePartId: vehiclePart.id,
        quantity: vehiclePart.quantity,
      })
    );

    return vehiclePartRepo.save(budgetVehicleParts);
  }

  async updateMany(parts: UpdateBudgetVehiclePartDto[], manager: EntityManager): Promise<void> {
    const repository = manager ? manager.getRepository(BudgetVehiclePart) : this.budgetVehiclePartRepository;

    const vehiclePartIds = parts.map(p => p.vehiclePartId);
    await this.validateVehiclePartIds(vehiclePartIds);

    for (const part of parts) {
      await repository
        .createQueryBuilder()
        .update(BudgetVehiclePart)
        .set({ quantity: part.quantity })
        .where("id = :id", { id: part.id })
        .execute();
    }
  }

  remove(vehiclePartsId: RemoveBudgetVehiclePartDto[], manager?: EntityManager): Promise<UpdateResult> {
    const repository = manager ? manager.getRepository(BudgetVehiclePart) : this.budgetVehiclePartRepository;

    return repository
      .createQueryBuilder()
      .softDelete()
      .whereInIds(vehiclePartsId)
      .execute();
  }
}
