import { Test, TestingModule } from '@nestjs/testing';
import { BudgetVehiclePartService } from './budget-vehicle-part.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BudgetVehiclePart } from '../entities/budget-vehicle-part.entity';
import { Repository, EntityManager, UpdateResult } from 'typeorm';
import { VehiclePartService } from '../../../../administrative-management/vehicle-part/domain/services/vehicle-part.service';
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
});

const mockVehiclePartService = () => ({
  findByIds: jest.fn(),
});

describe('BudgetVehiclePartService', () => {
  let service: BudgetVehiclePartService;
  let repo: jest.Mocked<Repository<BudgetVehiclePart>>;
  let vehiclePartService: ReturnType<typeof mockVehiclePartService>;

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
    it('should validate and create budgetVehicleParts', async () => {
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
  });

  describe('updateMany', () => {
    it('should validate and update parts using queryBuilder', async () => {
      const manager = {
        getRepository: jest.fn().mockReturnValue(repo),
      } as unknown as EntityManager;

      const dto = [
        { id: 1, quantity: 5, vehiclePartId: 10 },
        { id: 2, quantity: 3, vehiclePartId: 11 },
      ];

      vehiclePartService.findByIds.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockQueryBuilder.execute.mockResolvedValue({});

      await service.updateMany(dto, manager);

      expect(vehiclePartService.findByIds).toHaveBeenCalledWith([10, 11]);
      expect(mockQueryBuilder.update).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ quantity: expect.any(Number) });
      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should call softDelete with the provided vehiclePartsId list', async () => {
      const dto = [{ id: 1 }, { id: 2 }];
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 } as UpdateResult);

      const result = await service.remove(dto);

      expect(mockQueryBuilder.whereInIds).toHaveBeenCalledWith(dto);
      expect(mockQueryBuilder.softDelete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(result).toEqual({ affected: 2 });
    });
  });
});
