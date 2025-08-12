import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { ServiceOrderService } from './service-order.service';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { BudgetService } from '../../../../administrative-management/budget/domain/services/budget.service';
import { ServiceOrderHistoryService } from '../../../../administrative-management/service-order-history/domain/services/service-order-history.service';
import { DiagnosisService } from '../../../diagnosis/domain/services/diagnosis.service';
import { BudgetVehiclePartService } from '../../../../administrative-management/budget-vehicle-part/domain/services/budget-vehicle-part.service';
import { VehiclePartService } from '../../../../administrative-management/vehicle-part/domain/services/vehicle-part.service';
import { ServiceOrderStatus } from '../enum/service-order-status.enum';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
  getRepository: jest.fn().mockReturnValue(mockRepository),
};

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;

  const mockDiagnosisService = {
    create: jest.fn(),
  };

  const mockBudgetService = {
    create: jest.fn(),
  };

  const mockHistoryService = {
    logStatusChange: jest.fn(),
    getHistoryByServiceOrderId: jest.fn(),
  };

  const mockBudgetVehiclePartService = {
    findByBudgetId: jest.fn(),
  };

  const mockVehiclePartService = {
    findOne: jest.fn(),
    updatePart: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: BudgetService,
          useValue: mockBudgetService,
        },
        {
          provide: ServiceOrderHistoryService,
          useValue: mockHistoryService,
        },
        {
          provide: DiagnosisService,
          useValue: mockDiagnosisService,
        },
        {
          provide: BudgetVehiclePartService,
          useValue: mockBudgetVehiclePartService,
        },
        {
          provide: VehiclePartService,
          useValue: mockVehiclePartService,
        },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);

    jest.spyOn(service, 'runInTransaction').mockImplementation(async (fn) => {
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      } as unknown as EntityManager;
      return fn(manager);
    });
  });

  const mockUser = Object.assign(new User(), {
    id: 1,
    email: 'user@test.com',
    roles: ['user'],
  });

  const mockMechanic = Object.assign(new User(), {
    id: 2,
    roles: ['mechanic'],
  });

  const adminUser = Object.assign(new User(), {
    id: 9,
    roles: ['admin'],
  });

  describe('create', () => {
    it('deve criar OS com diagnóstico automático e orçamento', async () => {
      const dto = {
        vehicleId: 123,
        vehicleServicesIds: [10, 20],
        vehicleParts: [],
        description: 'Descrição teste',
      };

      mockDiagnosisService.create.mockResolvedValue({ id: 50 });
      mockBudgetService.create.mockResolvedValue({ id: 60 });
      mockRepository.create.mockReturnValue({
        description: 'Ordem de Serviço - Diagnóstico Automático',
        currentStatus: ServiceOrderStatus.RECEBIDA,
        customer: mockUser,
        vehicle: { id: dto.vehicleId },
        budget: { id: 60 },
      });
      mockRepository.save.mockResolvedValue({
        idServiceOrder: 100,
        description: 'Ordem de Serviço - Diagnóstico Automático',
        currentStatus: ServiceOrderStatus.RECEBIDA,
        customer: mockUser,
        vehicle: { id: dto.vehicleId },
        budget: { id: 60 },
      });

      const result = await service.create(mockUser, dto as any);

      expect(mockDiagnosisService.create).toHaveBeenCalledWith(
        {
          vehicleId: dto.vehicleId,
          responsibleMechanicId: undefined,
          description: dto.description,
        },
        expect.any(Object),
      );

      expect(mockBudgetService.create).toHaveBeenCalledWith(
        {
          ownerId: mockUser.id,
          diagnosisId: 50,
          description: 'Orçamento para diagnóstico automático',
          vehicleParts: dto.vehicleParts,
          vehicleServicesIds: dto.vehicleServicesIds,
        },
        expect.any(Object),
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Ordem de Serviço - Diagnóstico Automático',
          currentStatus: ServiceOrderStatus.RECEBIDA,
          customer: mockUser,
          vehicle: { id: dto.vehicleId },
          budget: { id: 60 },
        }),
      );

      expect(mockRepository.save).toHaveBeenCalled();

      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        100,
        mockUser.id,
        null,
        ServiceOrderStatus.RECEBIDA,
      );

      expect(result.idServiceOrder).toBe(100);
    });

    it('deve criar OS sem diagnóstico automático', async () => {
      const dto = {
        vehicleId: 123,
        description: 'Descrição simples',
      };

      mockRepository.create.mockReturnValue({
        description: dto.description,
        currentStatus: ServiceOrderStatus.RECEBIDA,
        customer: mockUser,
        vehicle: { id: dto.vehicleId },
        budget: null,
      });
      mockRepository.save.mockResolvedValue({
        idServiceOrder: 101,
        description: dto.description,
        currentStatus: ServiceOrderStatus.RECEBIDA,
        customer: mockUser,
        vehicle: { id: dto.vehicleId },
        budget: null,
      });

      const result = await service.create(mockUser, dto as any);

      expect(mockDiagnosisService.create).not.toHaveBeenCalled();
      expect(mockBudgetService.create).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: dto.description,
          currentStatus: ServiceOrderStatus.RECEBIDA,
          customer: mockUser,
          vehicle: { id: dto.vehicleId },
          budget: null,
        }),
      );
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        101,
        mockUser.id,
        null,
        ServiceOrderStatus.RECEBIDA,
      );
      expect(result.idServiceOrder).toBe(101);
    });
  });

  describe('findOne', () => {
    it('deve retornar OS se encontrada e user admin', async () => {
      mockRepository.findOne.mockResolvedValue({
        idServiceOrder: 1,
        active: true,
        customer: Object.assign(new User(), { id: 9, roles: ['admin'] }),
      });
      const adminUser = Object.assign(new User(), { id: 9, roles: ['admin'] });
      const result = await service.findOne(1, undefined, adminUser);
      expect(result).toEqual(expect.objectContaining({ idServiceOrder: 1, active: true }));
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { idServiceOrder: 1, active: true },
        relations: ['budget', 'customer', 'mechanic', 'vehicle'],
      });
    });

    it('deve retornar OS se encontrada e user não admin', async () => {
      mockRepository.findOne.mockResolvedValue({
        idServiceOrder: 2,
        active: true,
        customer: Object.assign(new User(), { id: 5, roles: ['user'] }),
      });
      const user = Object.assign(new User(), { id: 5, roles: ['user'] });
      const result = await service.findOne(2, undefined, user);
      expect(result).toEqual(expect.objectContaining({ idServiceOrder: 2, active: true }));
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { idServiceOrder: 2, active: true, customer: { id: 5 } },
        relations: ['budget', 'customer', 'mechanic', 'vehicle'],
      });
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999, undefined, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptOrder', () => {
    it('deve aceitar OS e atualizar mecânico e status', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: null,
        currentStatus: ServiceOrderStatus.RECEBIDA,
        budget: null,
      };
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (orderToSave) => orderToSave);

      const result = await service.acceptOrder(mockMechanic, 1, true);

      expect(result.mechanic).toEqual(mockMechanic);
      expect(
        [ServiceOrderStatus.AGUARDANDO_INICIO, ServiceOrderStatus.EM_DIAGNOSTICO]
      ).toContain(result.currentStatus);

      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        1,
        mockMechanic.id,
        ServiceOrderStatus.RECEBIDA,
        result.currentStatus,
      );
    });

    it('deve recusar OS e atualizar status e atualizar peças', async () => {
      const budget = { id: 50 };
      const order = {
        idServiceOrder: 2,
        mechanic: null,
        currentStatus: ServiceOrderStatus.RECEBIDA,
        budget,
      };

      mockBudgetVehiclePartService.findByBudgetId.mockResolvedValue([
        { vehiclePartId: 1, quantity: 5 },
        { vehiclePartId: 2, quantity: 3 },
      ]);

      mockVehiclePartService.findOne.mockImplementation((id) => {
        if (id === 1) return Promise.resolve({ id: 1, quantity: 2 });
        if (id === 2) return Promise.resolve({ id: 2, quantity: 4 });
        return Promise.resolve(null);
      });
      mockVehiclePartService.updatePart.mockResolvedValue(undefined);

      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (o) => o);

      const result = await service.acceptOrder(mockMechanic, 2, false);

      expect(result.currentStatus).toBe(ServiceOrderStatus.RECUSADA);
      expect(mockBudgetVehiclePartService.findByBudgetId).toHaveBeenCalledWith(50, expect.any(Object));
      expect(mockVehiclePartService.findOne).toHaveBeenCalledTimes(2);
      expect(mockVehiclePartService.updatePart).toHaveBeenCalledTimes(2);
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        2,
        mockMechanic.id,
        ServiceOrderStatus.RECEBIDA,
        ServiceOrderStatus.RECUSADA,
      );
    });

    it('não deve aceitar OS já aceita', async () => {
      mockRepository.findOne.mockResolvedValue({ idServiceOrder: 3, mechanic: { id: 99 } });
      await expect(service.acceptOrder(mockMechanic, 3, true)).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignBudget', () => {
    it('deve atribuir orçamento se mecânico correto e OS sem orçamento', async () => {
      const order = {
        idServiceOrder: 10,
        mechanic: mockMechanic,
        budget: null,
        currentStatus: ServiceOrderStatus.EM_DIAGNOSTICO,
        vehicle: { id: 111 },
        customer: { id: 123 },
      };

      mockRepository.findOne.mockResolvedValue(order);

      const diagnosis = { id: 200 };
      mockDiagnosisService.create.mockResolvedValue(diagnosis);

      const budget = { id: 300 };
      mockBudgetService.create.mockResolvedValue(budget);

      mockRepository.save.mockImplementation(async (o) => ({ ...o }));

      const assignBudgetDto = {
        description: 'Orçamento novo',
        vehicleParts: [],
        vehicleServicesIds: [],
      };

      const result = await service.assignBudget(mockMechanic, 10, assignBudgetDto);

      expect(mockDiagnosisService.create).toHaveBeenCalledWith(
        {
          description: assignBudgetDto.description,
          vehicleId: 111,
          responsibleMechanicId: mockMechanic.id,
        },
        expect.any(Object),
      );

      expect(mockBudgetService.create).toHaveBeenCalledWith(
        {
          description: 'Orçamento para diagnóstico automático',
          vehicleParts: assignBudgetDto.vehicleParts,
          diagnosisId: diagnosis.id,
          ownerId: order.customer.id,
          vehicleServicesIds: assignBudgetDto.vehicleServicesIds,
        },
        expect.any(Object),
      );

      expect(result.budget).toEqual(budget);
      expect(result.currentStatus).toBe(ServiceOrderStatus.AGUARDANDO_APROVACAO);
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        10,
        mockMechanic.id,
        ServiceOrderStatus.EM_DIAGNOSTICO,
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
      );
    });

    it('não deve atribuir orçamento se já existir', async () => {
      const order = {
        idServiceOrder: 11,
        mechanic: mockMechanic,
        budget: { id: 1 },
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.assignBudget(mockMechanic, 11, { description: '', vehicleParts: [], vehicleServicesIds: [] })).rejects.toThrow(BadRequestException);
    });

    it('não deve atribuir orçamento se mecânico for outro', async () => {
      const order = {
        idServiceOrder: 12,
        mechanic: { id: 99 },
        budget: null,
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.assignBudget(mockMechanic, 12, { description: '', vehicleParts: [], vehicleServicesIds: [] })).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se OS não encontrada', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.assignBudget(mockMechanic, 999, { description: '', vehicleParts: [], vehicleServicesIds: [] })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete da OS', async () => {
      const order = { idServiceOrder: 1, active: true };
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (o) => o);
      await service.remove(1);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
    });
  });

  describe('findByCustomerEmail', () => {
    it('deve retornar OSs do cliente', async () => {
      const orders = [{ idServiceOrder: 1 }, { idServiceOrder: 2 }];
      mockRepository.find.mockResolvedValue(orders);
      const result = await service.findByCustomerEmail('cliente@test.com');
      expect(result).toEqual(orders);
    });

    it('deve lançar NotFoundException se não encontrar OS', async () => {
      mockRepository.find.mockResolvedValue([]);
      await expect(service.findByCustomerEmail('x@test.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('startRepair', () => {
    it('deve iniciar reparo com mecânico correto e status correto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: mockMechanic,
        currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO,
      };
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (o) => o);
      const result = await service.startRepair(mockMechanic, 1);
      expect(result.currentStatus).toBe(ServiceOrderStatus.EM_EXECUCAO);
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        1,
        mockMechanic.id,
        ServiceOrderStatus.AGUARDANDO_INICIO,
        ServiceOrderStatus.EM_EXECUCAO,
      );
    });

    it('não deve iniciar reparo se mecânico incorreto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: { id: 99 },
        currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO,
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.startRepair(mockMechanic, 1)).rejects.toThrow(ForbiddenException);
    });

    it('não deve iniciar reparo se status incorreto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: mockMechanic,
        currentStatus: ServiceOrderStatus.RECEBIDA,
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.startRepair(mockMechanic, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('finishRepair', () => {
    it('deve finalizar reparo com mecânico correto e status correto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: mockMechanic,
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
      };
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (o) => o);
      const result = await service.finishRepair(mockMechanic, 1);
      expect(result.currentStatus).toBe(ServiceOrderStatus.FINALIZADA);
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        1,
        mockMechanic.id,
        ServiceOrderStatus.EM_EXECUCAO,
        ServiceOrderStatus.FINALIZADA,
      );
    });

    it('não deve finalizar reparo se mecânico incorreto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: { id: 99 },
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.finishRepair(mockMechanic, 1)).rejects.toThrow(ForbiddenException);
    });

    it('não deve finalizar reparo se status incorreto', async () => {
      const order = {
        idServiceOrder: 1,
        mechanic: mockMechanic,
        currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO,
      };
      mockRepository.findOne.mockResolvedValue(order);
      await expect(service.finishRepair(mockMechanic, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delivered', () => {
    it('deve confirmar entrega e atualizar status para ENTREGUE', async () => {
      const order = {
        idServiceOrder: 1,
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
        customer: mockUser,
        vehicle: { id: 10 },
      };
      mockRepository.findOne.mockResolvedValue(order);
      mockRepository.save.mockImplementation(async (o) => o);
      mockHistoryService.logStatusChange.mockResolvedValue(undefined);
  
      const result = await service.delivered(mockUser, 1);
  
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { idServiceOrder: 1, active: true },
        relations: ['budget', 'customer', 'mechanic', 'vehicle'],
      });
      expect(result.currentStatus).toBe(ServiceOrderStatus.ENTREGUE);
      expect(mockHistoryService.logStatusChange).toHaveBeenCalledWith(
        order.idServiceOrder,
        mockUser.id,
        ServiceOrderStatus.EM_EXECUCAO,
        ServiceOrderStatus.ENTREGUE,
      );
    });
  
    it('deve lançar ForbiddenException se o cliente não for dono da OS', async () => {
      const order = {
        idServiceOrder: 1,
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
        customer: { id: 999 },
        vehicle: { id: 10 },
      };
      mockRepository.findOne.mockResolvedValue(order);
  
      await expect(service.delivered(mockUser, 1)).rejects.toThrow(ForbiddenException);
    });
  
    it('deve lançar NotFoundException se não existir veículo na OS', async () => {
      const order = {
        idServiceOrder: 1,
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
        customer: mockUser,
        vehicle: null,
      };
      mockRepository.findOne.mockResolvedValue(order);
  
      await expect(service.delivered(mockUser, 1)).rejects.toThrow(NotFoundException);
    });
  });
  

  describe('getExecutionTimeById', () => {
    it('deve retornar tempo de execução correto em ms', async () => {
      const history = [
        { newStatus: ServiceOrderStatus.RECEBIDA, changedAt: new Date('2025-01-01T10:00:00Z') },
        { newStatus: ServiceOrderStatus.FINALIZADA, changedAt: new Date('2025-01-01T12:00:00Z') },
      ];
      mockHistoryService.getHistoryByServiceOrderId.mockResolvedValue(history);
  
      const result = await service.getExecutionTimeById(1);
  
      expect(result).toEqual({ executionTimeMs: 7200000 });
    });
  
    it('deve retornar mensagem se não encontrar histórico', async () => {
      mockHistoryService.getHistoryByServiceOrderId.mockResolvedValue([]);
  
      const result = await service.getExecutionTimeById(1);
  
      expect(result).toEqual({ message: 'Histórico da OS não encontrado.' });
    });
  
    it('deve retornar mensagem se RECEBIDA ou FINALIZADA não encontrados', async () => {
      const history = [
        { newStatus: ServiceOrderStatus.RECEBIDA, changedAt: new Date('2025-01-01T10:00:00Z') },
      ];
      mockHistoryService.getHistoryByServiceOrderId.mockResolvedValue(history);
  
      const result = await service.getExecutionTimeById(1);
  
      expect(result).toEqual({ message: 'Status RECEBIDA ou FINALIZADA não encontrados para esta OS.' });
    });
  
    it('deve retornar mensagem se FINALIZADA ocorrer antes de RECEBIDA', async () => {
      const history = [
        { newStatus: ServiceOrderStatus.RECEBIDA, changedAt: new Date('2025-01-01T12:00:00Z') },
        { newStatus: ServiceOrderStatus.FINALIZADA, changedAt: new Date('2025-01-01T10:00:00Z') },
      ];
      mockHistoryService.getHistoryByServiceOrderId.mockResolvedValue(history);
  
      const result = await service.getExecutionTimeById(1);
  
      expect(result).toEqual({ message: 'Status FINALIZADA ocorreu antes de RECEBIDA (dados inconsistentes).' });
    });
  });
  
});
