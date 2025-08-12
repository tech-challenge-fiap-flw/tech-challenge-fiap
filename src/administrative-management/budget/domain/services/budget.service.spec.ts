import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from '../../domain/services/budget.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Budget } from '../../domain/entities/budget.entity';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { DiagnosisService } from '../../../../administrative-management/diagnosis/domain/services/diagnosis.service';
import { VehiclePartService } from '../../../../administrative-management/vehicle-part/domain/services/vehicle-part.service';
import { BudgetVehiclePartService } from '../../../../administrative-management/budget-vehicle-part/domain/services/budget-vehicle-part.service';
import { VehicleServiceService } from '../../../vehicle-service/domain/services/vehicle-service.service';
import { BudgetVehicleServicesService } from '../../../../administrative-management/budget-vehicle-services/domain/services/budget-vehicle-services.service';
import { ServiceOrderHistoryService } from '../../../../administrative-management/service-order-history/domain/services/service-order-history.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ServiceOrderStatus } from '../../../../administrative-management/service-order/domain/enum/service-order-status.enum';

describe('BudgetService', () => {
  let service: BudgetService;
  let dataSource: DataSource;
  let manager: EntityManager;
  let repo: any;

  const userService = { findById: jest.fn() };
  const diagnosisService = { findById: jest.fn() };
  const vehiclePartService = { findOne: jest.fn(), updatePart: jest.fn() };
  const budgetVehiclePartService = { create: jest.fn(), remove: jest.fn(), updateMany: jest.fn(), findByBudgetId: jest.fn() };
  const vehicleServiceService = { findByIds: jest.fn() };
  const budgetVehicleServicesService = { create: jest.fn() };
  const historyService = { logStatusChange: jest.fn() };

  beforeEach(async () => {
    repo = {
      save: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
    } as any;

    manager = {
      getRepository: jest.fn().mockReturnValue(repo),
      createQueryBuilder: jest.fn().mockReturnValue({
        relation: jest.fn().mockReturnThis(),
        of: jest.fn().mockReturnThis(),
        addAndRemove: jest.fn(),
      }),
    } as any;

    dataSource = {
      transaction: jest.fn((cb) => cb(manager)),
      getRepository: jest.fn().mockReturnValue(repo),
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: DataSource, useValue: dataSource },
        { provide: UserService, useValue: userService },
        { provide: DiagnosisService, useValue: diagnosisService },
        { provide: VehiclePartService, useValue: vehiclePartService },
        { provide: BudgetVehiclePartService, useValue: budgetVehiclePartService },
        { provide: VehicleServiceService, useValue: vehicleServiceService },
        { provide: BudgetVehicleServicesService, useValue: budgetVehicleServicesService },
        { provide: ServiceOrderHistoryService, useValue: historyService },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a budget and return it', async () => {
      const createDto = {
        description: 'Budget description example',
        ownerId: 1,
        diagnosisId: 1,
        vehicleParts: [{ id: 10, quantity: 2 }],
        vehicleServicesIds: [1, 2],
      };

      userService.findById.mockResolvedValue({ id: 1 });
      diagnosisService.findById.mockResolvedValue({ id: 1 });
      vehicleServiceService.findByIds.mockResolvedValue([
        { id: 1, price: 100 },
        { id: 2, price: 200 },
      ]);
      vehiclePartService.findOne.mockResolvedValue({ id: 10, quantity: 5, price: 50 });
      vehiclePartService.updatePart.mockResolvedValue(undefined);
      repo.save.mockResolvedValue({ id: 123, ...createDto, total: 400 });

      budgetVehiclePartService.create.mockResolvedValue(undefined);
      budgetVehicleServicesService.create.mockResolvedValue(undefined);
      service.findById = jest.fn().mockResolvedValue({
        id: 123,
        ...createDto,
        total: 400,
      });

      const result = await service.create(createDto, manager);

      expect(userService.findById).toHaveBeenCalledWith(createDto.ownerId);
      expect(diagnosisService.findById).toHaveBeenCalledWith(createDto.diagnosisId, manager);
      expect(vehicleServiceService.findByIds).toHaveBeenCalledWith(createDto.vehicleServicesIds);
      expect(vehiclePartService.findOne).toHaveBeenCalledWith(10);
      expect(vehiclePartService.updatePart).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(budgetVehiclePartService.create).toHaveBeenCalled();
      expect(budgetVehicleServicesService.create).toHaveBeenCalled();
      expect(service.findById).toHaveBeenCalledWith(123, ['vehicleParts'], manager);
      expect(result.total).toBe(400);
      expect(result.id).toBe(123);
    });

    it('should throw if a vehicle service id does not exist', async () => {
      const createDto = {
        description: 'Budget description example',
        ownerId: 1,
        diagnosisId: 1,
        vehicleParts: [],
        vehicleServicesIds: [1, 2],
      };

      userService.findById.mockResolvedValue({ id: 1 });
      diagnosisService.findById.mockResolvedValue({ id: 1 });
      vehicleServiceService.findByIds.mockResolvedValue([{ id: 1, price: 100 }]);

      await expect(service.create(createDto, manager)).rejects.toThrow('Um ou mais serviços não foram encontrados');
    });

    it('should throw if vehicle part quantity insufficient', async () => {
      const createDto = {
        description: 'Budget description example',
        ownerId: 1,
        diagnosisId: 1,
        vehicleParts: [{ id: 10, quantity: 10 }],
        vehicleServicesIds: [],
      };

      userService.findById.mockResolvedValue({ id: 1 });
      diagnosisService.findById.mockResolvedValue({ id: 1 });
      vehicleServiceService.findByIds.mockResolvedValue([]);
      vehiclePartService.findOne.mockResolvedValue({ id: 10, quantity: 5, price: 50 });

      await expect(service.create(createDto, manager)).rejects.toThrow('Insufficient quantity for vehicle part with id 10');
    });
  });

  describe('findById', () => {
    it('should find a budget by id', async () => {
      repo.findOne.mockResolvedValue({ id: 1, description: 'desc' });
      const result = await service.findById(1, [], undefined, { id: 1, roles: ['admin'] } as any);
      expect(repo.findOne).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should throw if budget not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update(1, { description: 'desc', vehicleParts: [], vehicleServicesIds: [] })).rejects.toThrow(NotFoundException);
    });

    it('should throw if one of vehicle services does not exist', async () => {
      repo.findOne.mockResolvedValue({ id: 1, vehicleParts: [] });
      vehicleServiceService.findByIds.mockResolvedValue([{ id: 1 }]);

      await expect(service.update(1, { description: 'desc', vehicleParts: [], vehicleServicesIds: [1, 2] })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove a budget', async () => {
      const budget = {
        id: 1,
        vehicleParts: [{ id: 100 }, { id: 101 }],
      };

      service.findById = jest.fn().mockResolvedValue(budget);
      budgetVehiclePartService.remove.mockResolvedValue(undefined);
      repo.softRemove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(service.findById).toHaveBeenCalledWith(1, ['vehicleParts']);
      expect(budgetVehiclePartService.remove).toHaveBeenCalledWith([{ id: 100 }, { id: 101 }]);
      expect(repo.softRemove).toHaveBeenCalledWith(budget);
    });
  });

  describe('decideBudget', () => {
    it('should accept budget and update service order status', async () => {
      const budget = { id: 1, ownerId: 1 };
      const user = { id: 1 };
      const order = { currentStatus: ServiceOrderStatus.RECEBIDA, customer: { id: 1 }, budget: { id: 1 }, idServiceOrder: 123 };

      manager.getRepository = jest.fn()
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(budget) })
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(order) })
        .mockReturnValueOnce({ save: jest.fn().mockResolvedValue({ ...order, currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO }) });

      historyService.logStatusChange.mockResolvedValue(undefined);

      const result = await service.decideBudget(1, true, user as any);

      expect(result.currentStatus).toBe(ServiceOrderStatus.AGUARDANDO_INICIO);
      expect(historyService.logStatusChange).toHaveBeenCalledWith(order.idServiceOrder, user.id, ServiceOrderStatus.RECEBIDA, ServiceOrderStatus.AGUARDANDO_INICIO);
    });

    it('should throw if budget not found', async () => {
      manager.getRepository = jest.fn().mockReturnValue({ findOne: jest.fn().mockResolvedValue(null) });
      await expect(service.decideBudget(1, true, { id: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not owner of budget', async () => {
      manager.getRepository = jest.fn()
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue({ id: 1, ownerId: 2 }) });
      await expect(service.decideBudget(1, true, { id: 1 } as any)).rejects.toThrow(ForbiddenException);
    });

    it('should throw if service order not found', async () => {
      manager.getRepository = jest.fn()
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue({ id: 1, ownerId: 1 }) })
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(null) });
      await expect(service.decideBudget(1, true, { id: 1 } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not owner of service order', async () => {
      manager.getRepository = jest.fn()
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue({ id: 1, ownerId: 1 }) })
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue({ customer: { id: 2 } }) });
      await expect(service.decideBudget(1, true, { id: 1 } as any)).rejects.toThrow(ForbiddenException);
    });

    it('should reject budget and restore vehicle part quantities', async () => {
      const budget = { id: 1, ownerId: 1 };
      const user = { id: 1 };
      const order = { currentStatus: ServiceOrderStatus.RECEBIDA, customer: { id: 1 }, budget: { id: 1 }, idServiceOrder: 123 };

      const vehiclePartsInBudget = [
        { vehiclePartId: 10, quantity: 5 },
        { vehiclePartId: 11, quantity: 3 },
      ];

      manager.getRepository = jest.fn()
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(budget) })
        .mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(order) })
        .mockReturnValueOnce({ save: jest.fn().mockResolvedValue({ ...order, currentStatus: ServiceOrderStatus.RECUSADA }) });

      budgetVehiclePartService.findByBudgetId.mockResolvedValue(vehiclePartsInBudget);
      vehiclePartService.findOne.mockResolvedValue({ id: 10, quantity: 10 });
      vehiclePartService.updatePart.mockResolvedValue(undefined);
      historyService.logStatusChange.mockResolvedValue(undefined);

      const result = await service.decideBudget(1, false, user as any);

      expect(result.currentStatus).toBe(ServiceOrderStatus.RECUSADA);
      expect(vehiclePartService.updatePart).toHaveBeenCalledTimes(vehiclePartsInBudget.length);
      expect(historyService.logStatusChange).toHaveBeenCalledWith(order.idServiceOrder, user.id, ServiceOrderStatus.RECEBIDA, ServiceOrderStatus.RECUSADA);
    });
  });
});
