import { BudgetVehicleServiceMySqlRepository } from '../infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn()
}));

import * as mysql from '../../../infra/db/mysql';

describe('BudgetVehicleServiceMySqlRepository', () => {
  let repo: BudgetVehicleServiceMySqlRepository;

  beforeEach(() => {
    repo = new BudgetVehicleServiceMySqlRepository();
    jest.clearAllMocks();
  });

  it('create should insert and return restored entity', async () => {
    (mysql.insertOne as jest.Mock).mockResolvedValue({
      insertId: 55
    });

    const entity = BudgetVehicleServiceEntity.create({
      budgetId: 1,
      vehicleServiceId: 2,
      price: 10
    });

    const res = await repo.create(entity);

    expect(mysql.insertOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO budget_vehicle_services'),
      [1, 2, 10]
    );

    expect(res.toJSON()).toEqual({
      id: 55,
      budgetId: 1,
      vehicleServiceId: 2,
      price: 10
    });
  });

  it('findById should return null when no rows', async () => {
    (mysql.query as jest.Mock).mockResolvedValue([]);

    const res = await repo.findById(1);

    expect(mysql.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM budget_vehicle_services'),
      [1]
    );

    expect(res).toBeNull();
  });

  it('findById should return entity when row exists', async () => {
    (mysql.query as jest.Mock).mockResolvedValue([
      {
        id: 7,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 5
      }
    ]);

    const res = await repo.findById(7);

    expect(res?.toJSON()).toEqual({
      id: 7,
      budgetId: 1,
      vehicleServiceId: 2,
      price: 5
    });
  });

  it('update should build dynamic set and return updated entity', async () => {
    (mysql.update as jest.Mock).mockResolvedValue({
      affectedRows: 1
    });

    (mysql.query as jest.Mock).mockResolvedValue([
      {
        id: 9,
        budgetId: 2,
        vehicleServiceId: 3,
        price: 20
      }
    ]);

    const res = await repo.update(9, {
      price: 20
    });

    expect(mysql.update).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE budget_vehicle_services SET price = ? WHERE id = ?'),
      [20, 9]
    );

    expect(res?.toJSON().price).toBe(20);
  });

  it('delete should call deleteByField', async () => {
    (mysql.deleteByField as jest.Mock).mockResolvedValue({
      affectedRows: 1
    });

    await repo.delete(4);

    expect(mysql.deleteByField).toHaveBeenCalledWith(
      'budget_vehicle_services',
      'id',
      4
    );
  });
});
