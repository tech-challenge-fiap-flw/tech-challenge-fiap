import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from '../../domain/services/service-order.service';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { ServiceOrderStatus } from '../../domain/enum/service-order-status.enum';
import { CreateServiceOrderDto } from '../dto/create-service-order.dto';
import { AcceptServiceOrderDto } from '../dto/accept-service-order.dto';
import { AssignBudgetDto } from '../dto/assign-budget.dto';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { Vehicle } from '../../../../administrative-management/vehicle/domain/entities/vehicle.entity';
import { Budget } from '../../../../administrative-management/budget/domain/entities/budget.entity';

interface UserWithRoles extends User {
  roles: string[];
}

const mockUser = (overrides = {}): UserWithRoles => {
  const user = new User();
  user.id = 1;
  user.email = 'user@test.com';
  Object.assign(user, overrides);
  return {
    ...user,
    roles: ['user'],
  };
};

const mockUserFromJwt = (overrides = {}) => ({
  id: 1,
  email: 'user@test.com',
  name: 'User Test',
  roles: ['user'],
  ...overrides,
});

const mockBudget = (overrides = {}): Budget => {
  const budget = new Budget();
  budget.id = 2;
  budget.description = 'Orçamento teste';
  Object.assign(budget, overrides);
  return budget;
};

const mockVehicle = (overrides = {}): Vehicle => {
  const vehicle = new Vehicle();
  vehicle.id = 1;
  vehicle.model = 'Fusca';
  Object.assign(vehicle, overrides);
  return vehicle;
};

const mockVehiclePartItemDto = (overrides = {}) => ({
  id: 101,
  quantity: 2,
  ...overrides,
});

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let service: ServiceOrderService;

  const mockServiceOrder: ServiceOrder = {
    idServiceOrder: 1,
    description: 'Troca de óleo e filtro',
    currentStatus: ServiceOrderStatus.RECEBIDA,
    active: true,
    customer: mockUser({ id: 10, email: 'cliente@test.com', roles: ['cliente'] }),
    mechanic: null,
    budget: null,
    vehicle: mockVehicle({ id: 5, model: 'Fusca' }),
    creationDate: new Date(),
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockServiceOrder),
    findOne: jest.fn().mockResolvedValue(mockServiceOrder),
    findAll: jest.fn().mockResolvedValue([mockServiceOrder]),
    findByCustomerEmail: jest.fn().mockResolvedValue([mockServiceOrder]),
    remove: jest.fn().mockResolvedValue(undefined),
    acceptOrder: jest.fn().mockImplementation((user, id, accept) =>
      Promise.resolve({
        ...mockServiceOrder,
        mechanic: user,
        currentStatus: accept ? ServiceOrderStatus.EM_DIAGNOSTICO : ServiceOrderStatus.RECUSADA,
      }),
    ),
    assignBudget: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      budget: mockBudget(),
      currentStatus: ServiceOrderStatus.AGUARDANDO_APROVACAO,
    }),
    startRepair: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: ServiceOrderStatus.EM_EXECUCAO,
    }),
    finishRepair: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: ServiceOrderStatus.FINALIZADA,
    }),
    delivered: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: ServiceOrderStatus.ENTREGUE,
    }),
    getExecutionTimeById: jest.fn().mockResolvedValue(120),
    getAverageExecutionTime: jest.fn().mockResolvedValue(90),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
    service = module.get<ServiceOrderService>(ServiceOrderService);
  });

  it('deve criar uma OS', async () => {
    const dto: CreateServiceOrderDto = {
      description: 'Troca de óleo',
      vehicleId: 1,
    };
    const user = mockUser({ roles: ['cliente'] });
    const result = await controller.create(user, dto);
    expect(result).toEqual(mockServiceOrder);
    expect(service.create).toHaveBeenCalledWith(user, dto);
  });

  it('deve buscar uma OS por ID', async () => {
    const user = mockUserFromJwt();
    const id = 1;
    const result = await controller.findOne(user, id);
    expect(result).toEqual(mockServiceOrder);
    expect(service.findOne).toHaveBeenCalledWith(id, null, user);
  });
  
  it('deve buscar todas as OS', async () => {
    const user = mockUserFromJwt();
    const result = await controller.findAll(user);
    expect(result).toEqual([mockServiceOrder]);
    expect(service.findAll).toHaveBeenCalledWith(user);
  });

  it('deve buscar uma OS por e-mail do cliente', async () => {
    const email = 'cliente@test.com';
    const result = await controller.findByCustomerEmail(email);
    expect(result).toEqual([mockServiceOrder]);
    expect(service.findByCustomerEmail).toHaveBeenCalledWith(email);
  });

  it('deve remover (soft delete) uma OS', async () => {
    const id = 1;
    const result = await controller.remove(id);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(id);
  });

  it('deve aceitar uma OS', async () => {
    const user = mockUser({ roles: ['mechanic'] });
    const id = 1;
    const body: AcceptServiceOrderDto = { accept: true };
    const result = await controller.decideOrder(user, id, body);
    expect(result.mechanic).toEqual(user);
    expect(result.currentStatus).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    expect(service.acceptOrder).toHaveBeenCalledWith(user, id, true);
  });

  it('deve recusar uma OS', async () => {
    const user = mockUser({ roles: ['mechanic'] });
    const id = 1;
    const body: AcceptServiceOrderDto = { accept: false };

    mockService.acceptOrder.mockResolvedValueOnce({
      ...mockServiceOrder,
      mechanic: user,
      currentStatus: ServiceOrderStatus.RECUSADA,
    });

    const result = await controller.decideOrder(user, id, body);
    expect(result.mechanic).toEqual(user);
    expect(result.currentStatus).toBe(ServiceOrderStatus.RECUSADA);
    expect(service.acceptOrder).toHaveBeenCalledWith(user, id, false);
  });

  it('deve atribuir um orçamento', async () => {
    const user = mockUser({ roles: ['admin'] });
    const id = 1;

    const assignBudgetDto: AssignBudgetDto = {
      description: 'Orçamento detalhado com todas as peças e serviços',
      vehicleParts: [
        mockVehiclePartItemDto({ id: 1001, quantity: 2 }),
        mockVehiclePartItemDto({ id: 1002, quantity: 1 }),
      ],
      vehicleServicesIds: [1, 2],
    };

    const expectedResult = {
      ...mockServiceOrder,
      budget: mockBudget(),
      currentStatus: ServiceOrderStatus.AGUARDANDO_APROVACAO,
    };

    mockService.assignBudget.mockResolvedValueOnce(expectedResult);

    const result = await controller.assignBudget(user, id, assignBudgetDto);

    expect(result.budget).toEqual(mockBudget());
    expect(result.currentStatus).toBe(ServiceOrderStatus.AGUARDANDO_APROVACAO);
    expect(service.assignBudget).toHaveBeenCalledWith(user, id, assignBudgetDto);
  });

  it('deve iniciar o reparo da OS', async () => {
    const user = mockUser({ roles: ['mechanic'] });
    const id = 1;
    const result = await controller.startRepair(user, id);
    expect(result.currentStatus).toBe(ServiceOrderStatus.EM_EXECUCAO);
    expect(service.startRepair).toHaveBeenCalledWith(user, id);
  });

  it('deve finalizar o reparo da OS', async () => {
    const user = mockUser({ roles: ['admin'] });
    const id = 1;
    const result = await controller.finishRepair(user, id);
    expect(result.currentStatus).toBe(ServiceOrderStatus.FINALIZADA);
    expect(service.finishRepair).toHaveBeenCalledWith(user, id);
  });

  it('deve confirmar a entrega do veículo', async () => {
    const user = mockUser({ roles: ['cliente'] });
    const id = 1;
    const result = await controller.delivered(user, id);
    expect(result.currentStatus).toBe(ServiceOrderStatus.ENTREGUE);
    expect(service.delivered).toHaveBeenCalledWith(user, id);
  });

  it('deve obter o tempo de execução da OS pelo ID', async () => {
    const id = 1;
    const result = await controller.getExecutionTime(id);
    expect(result).toBe(120);
    expect(service.getExecutionTimeById).toHaveBeenCalledWith(id);
  });

  it('deve obter o tempo médio de execução de todas as OS', async () => {
    const result = await controller.getAverageExecutionTime();
    expect(result).toBe(90);
    expect(service.getAverageExecutionTime).toHaveBeenCalled();
  });
});
