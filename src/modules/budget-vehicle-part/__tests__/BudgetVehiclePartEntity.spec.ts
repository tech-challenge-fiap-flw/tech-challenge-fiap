import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';

describe('BudgetVehiclePartEntity', () => {
  it('create should set id=0 and keep fields', () => {
    const e = BudgetVehiclePartEntity.create({
      budgetId: 1,
      vehiclePartId: 2,
      quantity: 3
    });

    expect(e.toJSON()).toEqual({
      id: 0,
      budgetId: 1,
      vehiclePartId: 2,
      quantity: 3
    });
  });

  it('restore should keep provided id', () => {
    const e = BudgetVehiclePartEntity.restore({
      id: 77,
      budgetId: 1,
      vehiclePartId: 2,
      quantity: 5
    });

    expect(e.toJSON().id).toBe(77);
  });

  it('toJSON returns plain object copy', () => {
    const e = BudgetVehiclePartEntity.create({
      budgetId: 9,
      vehiclePartId: 8,
      quantity: 7
    });

    const json = e.toJSON();

    expect(json).toEqual({
      id: 0,
      budgetId: 9,
      vehiclePartId: 8,
      quantity: 7
    });

    json.quantity = 100;

    expect(e.toJSON().quantity).toBe(7);
  });
});
