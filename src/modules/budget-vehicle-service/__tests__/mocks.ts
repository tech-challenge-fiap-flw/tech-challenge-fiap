import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';

export function makeBudgetVehicleServiceInput(
  overrides: Partial<{ budgetId: number; vehicleServiceId: number; price?: number }> = {}
) {
  return {
    budgetId: overrides.budgetId ?? 1,
    vehicleServiceId: overrides.vehicleServiceId ?? 10,
    price: overrides.price
  };
}

export function makeBudgetVehicleServiceEntity(
  overrides: Partial<{ id: number; budgetId: number; vehicleServiceId: number; price?: number }> = {}
) {
  const id = overrides.id ?? 123;
  const budgetId = overrides.budgetId ?? 1;
  const vehicleServiceId = overrides.vehicleServiceId ?? 10;
  const price = overrides.price;

  return BudgetVehicleServiceEntity.restore({
    id,
    budgetId,
    vehicleServiceId,
    price
  });
}

export function makeNotFound(message = 'Budget Vehicle Service not found') {
  const { NotFoundServerException } = require('../../../shared/application/ServerException');

  return new NotFoundServerException(message);
}
