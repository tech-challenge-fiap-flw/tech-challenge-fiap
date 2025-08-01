import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from './budget.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { DiagnosisService } from '../../../../administrative-management/diagnosis/domain/services/diagnosis.service';
import { BudgetVehiclePartService } from '../../../../administrative-management/budget-vehicle-part/domain/services/budget-vehicle-part.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { NotFoundException } from '@nestjs/common';

const mockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue({
    manager: {
      getRepository: jest.fn(),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  }),
  transaction: jest.fn().mockImplementation(fn => fn({
    getRepository: jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue({ id: 1 }),
      findOne: jest.fn().mockResolvedValue({ id: 1, vehicleParts: [] }),
    }),
  })),
});

const mockBudgetRepo = () => ({
  findOne: jest.fn(),
  softRemove: jest.fn(),
});

const mockUserService = () => ({
  findById: jest.fn(),
});

const mockDiagnosisService = () => ({
  findById: jest.fn(),
});

const mockBudgetVehiclePartService = () => ({
  create: jest.fn(),
  updateMany: jest.fn(),
  remove: jest.fn(),
});

describe('BudgetService', () => {
  let service: BudgetService;
  let budgetRepo: jest.Mocked<Repository<Budget>>;
  let userService: ReturnType<typeof mockUserService>;
  let diagnosisService: ReturnType<typeof mockDiagnosisService>;
  let budgetVehiclePartService: ReturnType<typeof mockBudgetVehiclePartService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: DataSource, useFactory: mockDataSource },
        { provide: getRepositoryToken(Budget), useFactory: mockBudgetRepo },
        { provide: UserService, useFactory: mockUserService },
        { provide: DiagnosisService, useFactory: mockDiagnosisService },
        { provide: BudgetVehiclePartService, useFactory: mockBudgetVehiclePartService },
      ],
    }).compile();

    service = module.get(BudgetService);
    budgetRepo = module.get(getRepositoryToken(Budget));
    userService = module.get(UserService);
    diagnosisService = module.get(DiagnosisService);
    budgetVehiclePartService = module.get(BudgetVehiclePartService);
  });

  describe('create', () => {
    it('should create a budget with parts', async () => {
      const dto = {
        ownerId: 1,
        diagnosisId: 2,
        description: 'Teste orçamento',
        vehicleParts: [{ id: 10, quantity: 2 }],
      };

      userService.findById.mockResolvedValue({});
      diagnosisService.findById.mockResolvedValue({});

      const mockBudget = { id: 1 };
      const mockBudgetRepository = {
        save: jest.fn().mockResolvedValue(mockBudget),
      };

      const manager = {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === Budget) return mockBudgetRepository;
          return {};
        }),
      };

      jest.spyOn(service as any, 'runInTransaction').mockImplementation(async (fn: any) => {
        return await fn(manager);
      });

      jest.spyOn(service, 'findById').mockResolvedValue({
        id: 1,
        vehicleParts: [],
      } as Budget);

      const result = await service.create(dto as any);

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(diagnosisService.findById).toHaveBeenCalledWith(2);
      expect(mockBudgetRepository.save).toHaveBeenCalledWith({
        ownerId: 1,
        diagnosisId: 2,
        description: 'Teste orçamento',
      });
      expect(budgetVehiclePartService.create).toHaveBeenCalledWith(
        { budgetId: 1, vehicleParts: dto.vehicleParts },
        manager
      );
      expect(result).toEqual({ id: 1, vehicleParts: [] });
    });
  });

  describe('findById', () => {
    it('should return budget by id', async () => {
      budgetRepo.findOne.mockResolvedValue({ id: 1 } as Budget);
      const result = await service.findById(1);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if budget not found', async () => {
      budgetRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update budget, add/update/remove vehicle parts', async () => {
      const dto = {
        description: 'Atualizado',
        vehicleParts: [
          { id: 10, quantity: 3 },
          { id: 20, quantity: 1 },
        ],
      };

      const existingBudget = {
        id: 1,
        description: 'Antigo',
        vehicleParts: [
          { id: 1, vehiclePartId: 10, quantity: 1 },
          { id: 2, vehiclePartId: 99, quantity: 5 },
        ],
      };

      const manager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(existingBudget),
          save: jest.fn().mockResolvedValue({}),
        }),
      };

      jest.spyOn(service as any, 'runInTransaction').mockImplementation(async (fn: any) => {
        return await fn(manager);
      });
      jest.spyOn(service, 'findById').mockResolvedValue({ id: 1, vehicleParts: [] } as Budget);

      const result = await service.update(1, dto as any);

      expect(budgetVehiclePartService.remove).toHaveBeenCalledWith([{ id: 2 }], manager);
      expect(budgetVehiclePartService.updateMany).toHaveBeenCalledWith(
        [{ id: 1, vehiclePartId: 10, quantity: 3 }],
        manager
      );
      expect(budgetVehiclePartService.create).toHaveBeenCalledWith(
        { budgetId: 1, vehicleParts: [{ id: 20, quantity: 1 }] },
        manager
      );
      expect(result).toEqual({ id: 1, vehicleParts: [] });
    });
  });

  describe('remove', () => {
    it('should remove vehicle parts and soft remove budget', async () => {
      const mockBudget = {
        id: 1,
        vehicleParts: [{ id: 1 }, { id: 2 }],
      } as any;

      jest.spyOn(service, 'findById').mockResolvedValue(mockBudget);
      budgetRepo.softRemove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(budgetVehiclePartService.remove).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
      expect(budgetRepo.softRemove).toHaveBeenCalledWith(mockBudget);
    });
  });
});
