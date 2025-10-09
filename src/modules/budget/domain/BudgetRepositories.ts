import { BudgetEntity, BudgetId, BudgetProps } from './Budget';
import { BudgetVehiclePartEntity, BudgetVehiclePartId } from './BudgetVehiclePart';
import { BudgetVehicleServiceEntity, BudgetVehicleServiceId } from './BudgetVehicleService';

export interface BudgetRepository {
  create(entity: BudgetEntity): Promise<BudgetEntity>;
  findById(id: BudgetId): Promise<BudgetEntity | null>;
  update(id: BudgetId, partial: Partial<BudgetProps>): Promise<BudgetEntity>;
  updateTotal(id: BudgetId, total: number): Promise<void>;
  softDelete(id: BudgetId): Promise<void>;
  list(offset: number, limit: number): Promise<BudgetEntity[]>;
  countAll(): Promise<number>;
}

export interface BudgetVehiclePartRepository {
  add(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity>;
  remove(id: BudgetVehiclePartId): Promise<void>;
  listByBudget(budgetId: BudgetId): Promise<BudgetVehiclePartEntity[]>;
}

export interface BudgetVehicleServiceRepository {
  add(entity: BudgetVehicleServiceEntity): Promise<BudgetVehicleServiceEntity>;
  remove(id: BudgetVehicleServiceId): Promise<void>;
  listByBudget(budgetId: BudgetId): Promise<BudgetVehicleServiceEntity[]>;
}
