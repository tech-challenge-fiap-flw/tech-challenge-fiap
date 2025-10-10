import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository';

export type CreateBudgetVehiclePartInput = { budgetId: number; parts: { vehiclePartId: number; quantity: number }[] };
export type UpdateBudgetVehiclePartInput = { id: number; quantity: number; vehiclePartId: number }[];
export type RemoveBudgetVehiclePartInput = { ids: number[] };
export type BudgetVehiclePartOutput = ReturnType<BudgetVehiclePartEntity['toJSON']>;

export interface IBudgetVehiclePartService {
  createMany(input: CreateBudgetVehiclePartInput): Promise<BudgetVehiclePartOutput[]>;
}

export class BudgetVehiclePartService implements IBudgetVehiclePartService {
  constructor(private readonly repo: IBudgetVehiclePartRepository) {}

  async createMany(input: CreateBudgetVehiclePartInput): Promise<BudgetVehiclePartOutput[]> {
    const entities = input.parts.map(part => {
      return BudgetVehiclePartEntity.create({
        budgetId: input.budgetId,
        vehiclePartId: part.vehiclePartId,
        quantity: part.quantity
      })
    });

    const created = await this.repo.bulkCreate(entities);

    return created.map(c => c.toJSON());
  }
}
