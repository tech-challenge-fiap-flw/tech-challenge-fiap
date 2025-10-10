import { BudgetVehiclePartEntity } from './BudgetVehiclePart';

export interface IBudgetVehiclePartRepository {
  create(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity>;
  bulkCreate(entities: BudgetVehiclePartEntity[]): Promise<BudgetVehiclePartEntity[]>;
}
