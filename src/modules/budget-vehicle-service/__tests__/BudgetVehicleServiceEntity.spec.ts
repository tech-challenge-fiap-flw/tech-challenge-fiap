import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';

describe('BudgetVehicleServiceEntity', () => {
  it('should set price=0 when not provided on create', () => {
    const entity = BudgetVehicleServiceEntity.create({
      budgetId: 1,
      vehicleServiceId: 2
    });

    expect(entity.toJSON().price).toBe(0);
  });

  it('should keep provided positive price on create', () => {
    const entity = BudgetVehicleServiceEntity.create({
      budgetId: 1,
      vehicleServiceId: 2,
      price: 150
    });

    expect(entity.toJSON().price).toBe(150);
  });

  it('should produce plain json via toJSON', () => {
    const entity = BudgetVehicleServiceEntity.create({
      budgetId: 3,
      vehicleServiceId: 4
    });

    expect(entity.toJSON()).toEqual({
      id: undefined,
      budgetId: 3,
      vehicleServiceId: 4,
      price: 0
    });
  });

  it('should restore from persistence data', () => {
    const restored = BudgetVehicleServiceEntity.restore({
      id: 99,
      budgetId: 5,
      vehicleServiceId: 6,
      price: 42
    });

    expect(restored.toJSON()).toEqual({
      id: 99,
      budgetId: 5,
      vehicleServiceId: 6,
      price: 42
    });
  });
});
