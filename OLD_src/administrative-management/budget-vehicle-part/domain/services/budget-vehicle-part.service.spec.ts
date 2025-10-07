import { Test, TestingModule } from '@nestjs/testing';
import { BudgetVehiclePartService } from './budget-vehicle-part.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BudgetVehiclePart } from '../entities/budget-vehicle-part.entity';
import { Repository, EntityManager, UpdateResult } from 'typeorm';
import { VehiclePartService } from '../../../vehicle-part/domain/services/vehicle-part.service';
import { NotFoundException } from '@nestjs/common';

const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereInIds: jest.fn().mockReturnThis(),
  softDelete: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

const mockRepo = () => ({
  save: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  find: jest.fn(),
});

const mockVehiclePartService = () => ({
  findByIds: jest.fn(),
});

describe('BudgetVehiclePartService', () => {
  let service: BudgetVehiclePartService;
  let repo: jest.Mocked<Repository<BudgetVehiclePart>>;
  let vehiclePartService: ReturnType<typeof mockVehiclePartService>;

  const mockEntityManager = {
    getRepository: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetVehiclePartService,
        {
          provide: getRepositoryToken(BudgetVehiclePart),
          useFactory: mockRepo,
        },
        {
          provide: VehiclePartService,
          useFactory: mockVehiclePartService,
        },
      ],
    }).compile();

    service = module.get(BudgetVehiclePartService);
    repo = module.get(getRepositoryToken(BudgetVehiclePart));
    vehiclePartService = module.get(VehiclePartService);

    // Reset mocks
    mockQueryBuilder.update.mockClear();
    mockQueryBuilder.set.mockClear();
    mockQueryBuilder.where.mockClear();
    mockQueryBuilder.whereInIds.mockClear();
    mockQueryBuilder.softDelete.mockClear();
    mockQueryBuilder.execute.mockClear();
  });

  describe('findByBudgetId', () => {
    it('should find parts without manager', async () => {
      const expected = [{ id: 1 }, { id: 2 }] as BudgetVehiclePart[];
      repo.find.mockResolvedValue(expected);

      const result = await service.findByBudgetId(1);

      expect(repo.find).toHaveBeenCalledWith({ where: { budgetId: 1 } });
      expect(result).toEqual(expected);
    });

    it('should find parts with manager', async () => {
      const expected = [{ id: 3 }, { id: 4 }] as BudgetVehiclePart[];
      mockEntityManager.getRepository = jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue(expected),
      });

      const result = await service.findByBudgetId(2, mockEntityManager);

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(BudgetVehiclePart);
      expect(result).toEqual(expected);
    });
  });

  describe('validateVehiclePartIds', () => {
    it('should not throw if all IDs are valid', async () => {
      vehiclePartService.findByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await expect(service['validateVehiclePartIds']([1, 2])).resolves.not.toThrow();
    });

    it('should throw if some IDs are invalid', async () => {
      vehiclePartService.findByIds.mockResolvedValue([{ id: 1 }]);
      await expect(service['validateVehiclePartIds']([1, 2])).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should validate and create budgetVehicleParts without manager', async () => {
      const dto = {
        budgetId: 1,
        vehicleParts: [
          { id: 10, quantity: 2 },
          { id: 11, quantity: 1 },
        ],
      };

      vehiclePartService.findByIds.mockResolvedValue([{ id: 10 }, { id: 11 }]);

      const createdParts: BudgetVehiclePart[] = dto.vehicleParts.map((vp, i) => ({
        id: i + 1,
        quantity: vp.quantity,
        budgetId: dto.budgetId,
        vehiclePartId: vp.id,
        deletedAt: null,
        creationDate: new Date(),
        budget: null,
        vehiclePart: null,
      }));

      repo.create.mockImplementation((input) => input as BudgetVehiclePart);
      repo.save.mockResolvedValue(createdParts as any);

      const result = await service.create(dto);

      expect(vehiclePartService.findByIds).toHaveBeenCalledWith([10, 11]);
      expect(repo.create).toHaveBeenCalledTimes(2);
      expect(repo.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual(createdParts);
    });

    it('should validate and create budgetVehicleParts with manager', async () => {
      const dto = {
        budgetId: 2,
        vehicleParts: [
          { id: 20, quantity: 5 },
        ],
      };

      vehiclePartService.findByIds.mockResolvedValue([{ id: 20 }]);

      const vehiclePartRepo = {
        create: jest.fn().mockImplementation((input) => input),
        save: jest.fn().mockResolvedValue(dto.vehicleParts.map(vp => ({
          budgetId: dto.budgetId,
          vehiclePartId: vp.id,
          quantity: vp.quantity,
        }))),
      };

      mockEntityManager.getRepository = jest.fn().mockReturnValue(vehiclePartRepo);

      const result = await service.create(dto, mockEntityManager);

      expect(vehiclePartService.findByIds).toHaveBeenCalledWith([20]);
      expect(vehiclePartRepo.create).toHaveBeenCalledTimes(1);
      expect(vehiclePartRepo.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('updateMany', () => {
    it('should validate and update parts using queryBuilder', async () => {
      mockEntityManager.getRepository = jest.fn().mockReturnValue(repo);

      const dto = [
        { id: 1, quantity: 5, vehiclePartId: 10 },
        { id: 2, quantity: 3, vehiclePartId: 11 },
      ];

      vehiclePartService.findByIds.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockQueryBuilder.execute.mockResolvedValue({});

      await service.updateMany(dto, mockEntityManager);

      expect(vehiclePartService.findByIds).toHaveBeenCalledWith([10, 11]);
      expect(mockQueryBuilder.update).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ quantity: expect.any(Number) });
      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(2);
    });

    it('should throw if validateVehiclePartIds fails in updateMany', async () => {
      mockEntityManager.getRepository = jest.fn().mockReturnValue(repo);

      const dto = [
        { id: 1, quantity: 5, vehiclePartId: 10 },
        { id: 2, quantity: 3, vehiclePartId: 11 },
      ];

      vehiclePartService.findByIds.mockResolvedValue([{ id: 10 }]); // 11 missing

      await expect(service.updateMany(dto, mockEntityManager)).rejects.toThrow(NotFoundException);

      expect(vehiclePartService.findByIds).toHaveBeenCalledWith([10, 11]);
    });
  });
});