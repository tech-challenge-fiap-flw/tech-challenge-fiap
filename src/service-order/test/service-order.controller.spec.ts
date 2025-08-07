import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderController } from '../service-order.controller';
import { ServiceOrderService } from '../service-order.service';
import { ServiceOrder } from '../entities/service-order.entity';
import { CreateServiceOrderDto } from '../dto/create-service-order.dto';
import { mockUser } from './mocks/mock-user';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let service: ServiceOrderService;

  const mockServiceOrder: ServiceOrder = {
    idServiceOrder: 1,
    description: 'Troca de óleo',
    currentStatus: 'Recebida',
    active: true,
    customer: mockUser({ id: 1, email: 'cliente@test.com', type: 'cliente' }),
    mechanic: null,
    budget: null,
    vehicle: { id: 1 } as any,
    creationDate: new Date()
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockServiceOrder),
    findOne: jest.fn().mockResolvedValue(mockServiceOrder),
    findByCustomerEmail: jest.fn().mockResolvedValue([mockServiceOrder]),
    remove: jest.fn().mockResolvedValue(undefined),
    acceptOrder: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      mechanic: mockUser({ id: 5, type: 'mechanic' }),
      currentStatus: 'Em diagnóstico',
    }),
    assignBudget: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      budget: { id: 2 },
      currentStatus: 'Aguardando aprovação',
    }),
    startRepair: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: 'Em execução',
    }),
    finishRepair: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: 'Finalizada',
    }),
    delivered: jest.fn().mockResolvedValue({
      ...mockServiceOrder,
      currentStatus: 'Entregue',
    }),
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
    const user = mockUser({ id: 1, type: 'cliente' });
    const result = await controller.create(user, dto);
    expect(result).toEqual(mockServiceOrder);
    expect(service.create).toHaveBeenCalledWith(user, dto);
  });

  it('deve buscar uma OS por ID', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockServiceOrder);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('deve buscar uma OS por e-mail do cliente', async () => {
    const email = 'cliente@test.com';
    const result = await controller.findByCustomerEmail(email);
    expect(result).toEqual([mockServiceOrder]);
    expect(service.findByCustomerEmail).toHaveBeenCalledWith(email);
  });

  it('deve remover (soft delete) uma OS', async () => {
    const result = await controller.remove(1);
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('deve permitir que um mecânico aceite uma OS', async () => {
    const mechanic = mockUser({ id: 5, type: 'mechanic' });
    const result = await controller.acceptOrder(mechanic, 1);
    expect(result.mechanic.id).toBe(5);
    expect(result.currentStatus).toBe('Em diagnóstico');
    expect(service.acceptOrder).toHaveBeenCalledWith(mechanic, 1);
  });

  it('deve permitir que um mecânico atribua um orçamento', async () => {
    const mechanic = mockUser({ id: 5, type: 'mechanic' });
    const result = await controller.assignBudget(mechanic, 1, 2);
    expect(result.budget).toEqual({ id: 2 });
    expect(result.currentStatus).toBe('Aguardando aprovação');
    expect(service.assignBudget).toHaveBeenCalledWith(mechanic, 1, 2);
  });

  it('deve permitir que o mecânico inicie o reparo', async () => {
    const mechanic = mockUser({ id: 5, type: 'mechanic' });
    const result = await controller.startRepair(mechanic, 1);
    expect(result.currentStatus).toBe('Em execução');
    expect(service.startRepair).toHaveBeenCalledWith(mechanic, 1);
  });

  it('deve permitir que o mecânico finalize o reparo', async () => {
    const mechanic = mockUser({ id: 5, type: 'mechanic' });
    const result = await controller.finishRepair(mechanic, 1);
    expect(result.currentStatus).toBe('Finalizada');
    expect(service.finishRepair).toHaveBeenCalledWith(mechanic, 1);
  });

  it('deve permitir que o cliente confirme a entrega', async () => {
    const cliente = mockUser({ id: 1, type: 'cliente' });
    const result = await controller.delivered(cliente, 1);
    expect(result.currentStatus).toBe('Entregue');
    expect(service.delivered).toHaveBeenCalledWith(cliente, 1);
  });
});
