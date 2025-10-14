import { BudgetVehicleServiceService, IBudgetVehicleServiceService } from '../application/BudgetVehicleServiceService';
import { IBudgetVehicleServiceMySqlRepository } from '../domain/IBudgetVehicleServiceMySqlRepository';
import { NotFoundServerException } from '../../../shared/application/ServerException';
import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleServiceEntity';

function makeRepoMock(): jest.Mocked<IBudgetVehicleServiceMySqlRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  } as any;
}

describe('BudgetVehicleServiceService', () => {
  let repo: jest.Mocked<IBudgetVehicleServiceMySqlRepository>;
  let service: IBudgetVehicleServiceService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new BudgetVehicleServiceService(repo);
  });

  describe('create', () => {
    it('should delegate to repository and return entity', async () => {
      const created = BudgetVehicleServiceEntity.restore({
        id: 1,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 0
      });

      repo.create.mockResolvedValue(created);

      const result = await service.create({
        budgetId: 1,
        vehicleServiceId: 2
      });

      expect(repo.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 0
      });
    });
  });

  describe('createMany', () => {
    it('should call create for each vehicleServiceId', async () => {
      repo.create.mockImplementation(async (entity) => {
        const json = entity.toJSON();

        return BudgetVehicleServiceEntity.restore({
          ...json,
          id: json.vehicleServiceId
        });
      });

      const res = await service.createMany({
        budgetId: 5,
        vehicleServiceIds: [10, 11, 12]
      });

      expect(repo.create).toHaveBeenCalledTimes(3);
      expect(res).toHaveLength(3);
      expect(res.map(r => r.id)).toEqual([10, 11, 12]);
    });

    it('should handle empty vehicleServiceIds array', async () => {
      const res = await service.createMany({
        budgetId: 5,
        vehicleServiceIds: []
      });

      expect(repo.create).not.toHaveBeenCalled();
      expect(res).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update when entity exists', async () => {
      repo.findById.mockResolvedValue(
        BudgetVehicleServiceEntity.restore({
          id: 7,
          budgetId: 1,
          vehicleServiceId: 2,
          price: 0
        })
      );

      repo.update.mockResolvedValue(
        BudgetVehicleServiceEntity.restore({
          id: 7,
          budgetId: 1,
          vehicleServiceId: 2,
          price: 99
        })
      );

      const result = await service.update(7, { price: 99 });

      expect(repo.findById).toHaveBeenCalledWith(7);
      expect(repo.update).toHaveBeenCalledWith(7, { price: 99 });
      expect(result.price).toBe(99);
    });

    it('should throw NotFound when entity does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update(99, { price: 10 })
      ).rejects.toBeInstanceOf(NotFoundServerException);

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete when entity exists', async () => {
      repo.findById.mockResolvedValue(
        BudgetVehicleServiceEntity.restore({
          id: 8,
          budgetId: 1,
          vehicleServiceId: 2,
          price: 0
        })
      );

      repo.delete.mockResolvedValue();

      await service.delete(8);

      expect(repo.findById).toHaveBeenCalledWith(8);
      expect(repo.delete).toHaveBeenCalledWith(8);
    });

    it('should throw NotFound when entity missing', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.delete(55)
      ).rejects.toBeInstanceOf(NotFoundServerException);

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return entity when exists', async () => {
      repo.findById.mockResolvedValue(
        BudgetVehicleServiceEntity.restore({
          id: 3,
          budgetId: 1,
          vehicleServiceId: 2,
          price: 10
        })
      );

      const res = await service.findById(3);

      expect(res.id).toBe(3);
    });

    it('should throw NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.findById(404)
      ).rejects.toBeInstanceOf(NotFoundServerException);
    });
  });
});
