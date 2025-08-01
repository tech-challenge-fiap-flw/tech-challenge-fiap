import { Test, TestingModule } from '@nestjs/testing';
import { BudgetController } from './budget.controller';
import { BudgetService } from '../../domain/services/budget.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { NotFoundException } from '@nestjs/common';

describe('BudgetController', () => {
  let controller: BudgetController;
  let service: BudgetService;

  const mockBudgetService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        { provide: BudgetService, useValue: mockBudgetService },
      ],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    service = module.get<BudgetService>(BudgetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a budget response dto', async () => {
      const createDto: CreateBudgetDto = {
        ownerId: 1,
        diagnosisId: 2,
        description: 'Orçamento teste',
        vehicleParts: [{ id: 10, quantity: 2 }],
      };

      const createdBudget = {
        id: 1,
        description: createDto.description,
        deletedAt: null,
        creationDate: new Date(),
        ownerId: createDto.ownerId,
        diagnosisId: createDto.diagnosisId,
        vehicleParts: [{ id: 10, quantity: 2 }],
      };

      mockBudgetService.create.mockResolvedValue(createdBudget);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: createdBudget.id,
        description: createdBudget.description,
        deletedAt: createdBudget.deletedAt,
        creationDate: createdBudget.creationDate,
        ownerId: createdBudget.ownerId,
        diagnosisId: createdBudget.diagnosisId,
        vehicleParts: createdBudget.vehicleParts.map((vp) => ({
          id: vp.id,
          quantity: vp.quantity,
        })),
      });
    });
  });

  describe('update', () => {
    it('should update and return a budget response dto', async () => {
      const id = 1;
      const updateDto: UpdateBudgetDto = {
        description: 'Atualizado',
        vehicleParts: [{ id: 10, quantity: 3 }],
      };

      const updatedBudget = {
        id,
        description: updateDto.description,
        deletedAt: null,
        creationDate: new Date(),
        ownerId: 1,
        diagnosisId: 2,
        vehicleParts: updateDto.vehicleParts,
      };

      mockBudgetService.update.mockResolvedValue(updatedBudget);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual({
        id: updatedBudget.id,
        description: updatedBudget.description,
        deletedAt: updatedBudget.deletedAt,
        creationDate: updatedBudget.creationDate,
        ownerId: updatedBudget.ownerId,
        diagnosisId: updatedBudget.diagnosisId,
        vehicleParts: updatedBudget.vehicleParts.map((vp) => ({
          id: vp.id,
          quantity: vp.quantity,
        })),
      });
    });
  });

  describe('remove', () => {
    it('should call remove service method with correct id', async () => {
      const id = 1;

      mockBudgetService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(id)).resolves.toBeUndefined();

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
