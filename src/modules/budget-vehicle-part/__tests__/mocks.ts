import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';

export function makePartInput(overrides: Partial<{ budgetId: number; vehiclePartId: number; quantity: number }> = {}) {
  return {
    budgetId: overrides.budgetId ?? 1,
    vehiclePartId: overrides.vehiclePartId ?? 10,
    quantity: overrides.quantity ?? 2
  };
}

export function makeEntity(overrides: Partial<{ id: number; budgetId: number; vehiclePartId: number; quantity: number }> = {}) {
  return BudgetVehiclePartEntity.restore({
    id: overrides.id ?? 99,
    budgetId: overrides.budgetId ?? 1,
    vehiclePartId: overrides.vehiclePartId ?? 10,
    quantity: overrides.quantity ?? 2
  });
}
