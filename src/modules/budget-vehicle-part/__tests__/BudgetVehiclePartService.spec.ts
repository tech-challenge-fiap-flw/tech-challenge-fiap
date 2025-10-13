import { BudgetVehiclePartService, IBudgetVehiclePartService } from '../application/BudgetVehiclePartService';
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';

function repoMock(): jest.Mocked<IBudgetVehiclePartRepository> {
  return {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    listByBudget: jest.fn(),
    updateQuantity: jest.fn(),
    deleteByIds: jest.fn()
  } as any;
}

function makeEntity(
  id: number,
  budgetId: number,
  vehiclePartId: number,
  quantity: number
) {
  return BudgetVehiclePartEntity.restore({
    id,
    budgetId,
    vehiclePartId,
    quantity
  });
}

describe('BudgetVehiclePartService', () => {
  let repo: jest.Mocked<IBudgetVehiclePartRepository>;
  let service: IBudgetVehiclePartService;

  beforeEach(() => {
    repo = repoMock();

    service = new BudgetVehiclePartService(repo);
  });

  describe('createMany', () => {
    it('should map input parts to entities and call bulkCreate once', async () => {
      const returned = [
        makeEntity(1, 1, 10, 2),
        makeEntity(2, 1, 11, 3)
      ];

      repo.bulkCreate.mockResolvedValue(returned);

      const output = await service.createMany({
        budgetId: 1,
        parts: [
          { vehiclePartId: 10, quantity: 2 },
          { vehiclePartId: 11, quantity: 3 }
        ]
      });

      expect(repo.bulkCreate).toHaveBeenCalledTimes(1);

      expect(output).toEqual([
        { id: 1, budgetId: 1, vehiclePartId: 10, quantity: 2 },
        { id: 2, budgetId: 1, vehiclePartId: 11, quantity: 3 }
      ]);
    });
  });

  describe('listByBudget', () => {
    it('should return mapped rows', async () => {
      repo.listByBudget.mockResolvedValue([
        makeEntity(5, 2, 20, 4)
      ]);

      const res = await service.listByBudget(2);

      expect(repo.listByBudget).toHaveBeenCalledWith(2);

      expect(res).toEqual([
        { id: 5, budgetId: 2, vehiclePartId: 20, quantity: 4 }
      ]);
    });
  });

  describe('updateMany', () => {
    it('should call updateQuantity for each item', async () => {
      await service.updateMany([
        { id: 1, quantity: 10, vehiclePartId: 10 },
        { id: 2, quantity: 20, vehiclePartId: 11 }
      ]);

      expect(repo.updateQuantity).toHaveBeenCalledTimes(2);

      expect(repo.updateQuantity).toHaveBeenNthCalledWith(1, 1, 10);

      expect(repo.updateQuantity).toHaveBeenNthCalledWith(2, 2, 20);
    });

    it('should not call updateQuantity when empty list', async () => {
      await service.updateMany([]);

      expect(repo.updateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('removeMany', () => {
    it('should call deleteByIds with provided ids', async () => {
      await service.removeMany({ ids: [1, 2, 3] });

      expect(repo.deleteByIds).toHaveBeenCalledWith([1, 2, 3]);
    });
  });
});
