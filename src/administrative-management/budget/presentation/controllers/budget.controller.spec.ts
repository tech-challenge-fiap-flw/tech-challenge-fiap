import { Test, TestingModule } from '@nestjs/testing';
import { BudgetController } from '../../presentation/controllers/budget.controller';
import { BudgetService } from '../../domain/services/budget.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('BudgetController', () => {
  let controller: BudgetController;
  let service: BudgetService;

  const mockBudget = {
    id: 1,
    description: 'Budget description',
    deletedAt: null,
    creationDate: new Date(),
    ownerId: 10,
    diagnosisId: 5,
    total: 1000,
    vehicleParts: [{ id: 1, quantity: 2 }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        {
          provide: BudgetService,
          useValue: {
            update: jest.fn(),
            findById: jest.fn(),
            remove: jest.fn(),
            decideBudget: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    service = module.get<BudgetService>(BudgetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should call service.update and return mapped response', async () => {
      service.update = jest.fn().mockResolvedValue(mockBudget);

      const updateDto = {
        description: 'Updated description',
        vehicleParts: [{ id: 1, quantity: 3 }],
        vehicleServicesIds: [1, 2],
      };

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({
        id: mockBudget.id,
        description: mockBudget.description,
        deletedAt: mockBudget.deletedAt,
        creationDate: mockBudget.creationDate,
        ownerId: mockBudget.ownerId,
        diagnosisId: mockBudget.diagnosisId,
        total: mockBudget.total,
        vehicleParts: mockBudget.vehicleParts.map(vp => ({
          id: vp.id,
          quantity: vp.quantity,
        })),
      });
    });
  });

  describe('findOne', () => {
    it('should call service.findById and return mapped response', async () => {
      service.findById = jest.fn().mockResolvedValue(mockBudget);

      const mockUser = { id: 10, name: 'tester da silva', email: 'test@test.com', roles: ['user'] };

      const result = await controller.findOne(mockUser, 1);

      expect(service.findById).toHaveBeenCalledWith(1, ['vehicleParts'], null, mockUser);
      expect(result).toEqual({
        id: mockBudget.id,
        description: mockBudget.description,
        deletedAt: mockBudget.deletedAt,
        creationDate: mockBudget.creationDate,
        ownerId: mockBudget.ownerId,
        diagnosisId: mockBudget.diagnosisId,
        total: mockBudget.total,
        vehicleParts: mockBudget.vehicleParts.map(vp => ({
          id: vp.id,
          quantity: vp.quantity,
        })),
      });
    });

    it('should throw if service.findById throws', async () => {
      service.findById = jest.fn().mockRejectedValue(new NotFoundException());
      const mockUser = { id: 10, name: 'tester da silva', email: 'test@test.com', roles: ['user'] };

      await expect(controller.findOne(mockUser, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      service.remove = jest.fn().mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('decideBudget', () => {
    it('should call service.decideBudget with correct params', async () => {
      const acceptDto = { accept: true };
      const mockUser = { id: 10 };

      service.decideBudget = jest.fn().mockResolvedValue('result');

      const result = await controller.decideBudget(1, acceptDto.accept, mockUser as any);

      expect(service.decideBudget).toHaveBeenCalledWith(1, true, mockUser);
      expect(result).toBe('result');
    });

    it('should propagate error from service.decideBudget', async () => {
      const acceptDto = { accept: false };
      const mockUser = { id: 10 };

      service.decideBudget = jest.fn().mockRejectedValue(new ForbiddenException());

      await expect(controller.decideBudget(1, acceptDto.accept, mockUser as any)).rejects.toThrow(ForbiddenException);
    });
  });
});
