import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth-and-access/user/domain/entities/user.entity';
import { Budget } from 'src/administrative-management/budget/domain/entities/budget.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ServiceOrderService } from '../service-order.service';
import { ServiceOrder } from '../entities/service-order.entity';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repo: Repository<ServiceOrder>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        {
          provide: getRepositoryToken(ServiceOrder),
          useValue: mockRepo,
        },
      ],
    }).compile();
    service = module.get<ServiceOrderService>(ServiceOrderService);
    repo = module.get<Repository<ServiceOrder>>(getRepositoryToken(ServiceOrder));
    jest.clearAllMocks();
  });

  const mockUser = { id: 1, email: 'cliente@test.com', type: 'cliente' } as User;

  it('deve criar uma OS', async () => {
    const dto = { description: 'Troca de óleo', vehicleId: 1 };
    const createdOrder = {
      idServiceOrder: 1,
      description: dto.description,
      currentStatus: 'Recebida',
      customer: mockUser,
      vehicle: { id: dto.vehicleId },
      budget: undefined,
    } as ServiceOrder;
    mockRepo.create.mockReturnValue(createdOrder);
    mockRepo.save.mockResolvedValue(createdOrder);
    const result = await service.create(mockUser, dto as any);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Troca de óleo',
      currentStatus: 'Recebida',
      customer: mockUser,
      vehicle: { id: 1 },
      budget: undefined,
    }));
    expect(result).toEqual(createdOrder);
  });

  it('deve buscar uma OS por ID', async () => {
    const order = { idServiceOrder: 1, active: true } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    const result = await service.findOne(1);
    expect(result).toEqual(order);
  });

  it('deve lançar erro se OS não for encontrada', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar o status da OS', async () => {
    const order = { idServiceOrder: 1, currentStatus: 'Recebida' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.save.mockResolvedValue({ ...order, currentStatus: 'Concluída' });
    const result = await service.updateStatus(1, 'Concluída');
    expect(result.currentStatus).toBe('Concluída');
  });

  it('deve aceitar uma OS e atribuir mecânico e status', async () => {
    const mechanic = { id: 5, type: 'mechanic' } as User;
    const order = { idServiceOrder: 1, mechanic: null } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.save.mockResolvedValue({ ...order, mechanic, currentStatus: 'Em diagnóstico' });
    const result = await service.acceptOrder(mechanic, 1);
    expect(result.mechanic).toEqual(mechanic);
    expect(result.currentStatus).toBe('Em diagnóstico');
  });

  it('não deve aceitar OS já aceita por outro mecânico', async () => {
    const order = { idServiceOrder: 1, mechanic: { id: 99 } } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.acceptOrder({ id: 5 } as User, 1)).rejects.toThrow(BadRequestException);
  });

  it('deve atribuir orçamento se mecânico for o correto e OS não tiver orçamento', async () => {
    const mechanic = { id: 5 } as User;
    const order = { idServiceOrder: 1, mechanic, budget: null } as ServiceOrder;
    const budget = { id: 10 } as Budget;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.manager.findOne.mockResolvedValue(budget);
    mockRepo.save.mockResolvedValue({ ...order, budget, currentStatus: 'Aguardando aprovação' });
    const result = await service.assignBudget(mechanic, 1, 10);
    expect(result.budget).toEqual(budget);
    expect(result.currentStatus).toBe('Aguardando aprovação');
  });

  it('não deve atribuir orçamento se já houver um', async () => {
    const mechanic = { id: 5 } as User;
    const order = { idServiceOrder: 1, mechanic, budget: { id: 10 } } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.assignBudget(mechanic, 1, 11)).rejects.toThrow(BadRequestException);
  });

  it('não deve atribuir orçamento se usuário não for mecânico da OS', async () => {
    const order = { idServiceOrder: 1, mechanic: { id: 99 }, budget: null } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.assignBudget({ id: 5 } as User, 1, 10)).rejects.toThrow(ForbiddenException);
  });

  it('deve fazer soft delete da OS', async () => {
    const order = { idServiceOrder: 1, active: true } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await service.remove(1);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });

  it('deve buscar OSs pelo e-mail do cliente', async () => {
    const orders = [{ idServiceOrder: 1 }, { idServiceOrder: 2 }] as ServiceOrder[];
    mockRepo.find.mockResolvedValue(orders);
    const result = await service.findByCustomerEmail('cliente@test.com');
    expect(result).toHaveLength(2);
  });

  it('deve lançar erro se não encontrar OSs para e-mail', async () => {
    mockRepo.find.mockResolvedValue([]);
    await expect(service.findByCustomerEmail('x@test.com')).rejects.toThrow(NotFoundException);
  });

  it('deve iniciar reparo se mecânico for o correto e status "Aguardando início"', async () => {
    const mechanic = { id: 5, type: 'mechanic' } as User;
    const order = { idServiceOrder: 1, mechanic, currentStatus: 'Aguardando início' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.save.mockResolvedValue({ ...order, currentStatus: 'Em execução' });
    const result = await service.startRepair(mechanic, 1);
    expect(result.currentStatus).toBe('Em execução');
  });

  it('não deve permitir iniciar reparo se mecânico não for o correto', async () => {
    const order = { idServiceOrder: 1, mechanic: { id: 99 }, currentStatus: 'Aguardando início' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.startRepair({ id: 5 } as User, 1)).rejects.toThrow(ForbiddenException);
  });

  it('não deve permitir iniciar reparo se status não for "Aguardando início"', async () => {
    const mechanic = { id: 5 } as User;
    const order = { idServiceOrder: 1, mechanic, currentStatus: 'Recebida' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.startRepair(mechanic, 1)).rejects.toThrow(BadRequestException);
  });

  it('deve finalizar reparo se mecânico for o correto e status "Em execução"', async () => {
    const mechanic = { id: 5, type: 'mechanic' } as User;
    const order = { idServiceOrder: 1, mechanic, currentStatus: 'Em execução' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.save.mockResolvedValue({ ...order, currentStatus: 'Finalizada' });
    const result = await service.finishRepair(mechanic, 1);
    expect(result.currentStatus).toBe('Finalizada');
  });

  it('não deve permitir finalizar reparo se mecânico não for o correto', async () => {
    const order = { idServiceOrder: 1, mechanic: { id: 99 }, currentStatus: 'Em execução' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.finishRepair({ id: 5 } as User, 1)).rejects.toThrow(ForbiddenException);
  });

  it('não deve permitir finalizar reparo se status não for "Em execução"', async () => {
    const mechanic = { id: 5 } as User;
    const order = { idServiceOrder: 1, mechanic, currentStatus: 'Recebida' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.finishRepair(mechanic, 1)).rejects.toThrow(BadRequestException);
  });

  it('deve confirmar entrega do veículo se for o cliente correto e veículo existir', async () => {
    const customer = { id: 1, type: 'cliente' } as User;
    const order = { idServiceOrder: 1, customer, vehicle: { id: 123 }, currentStatus: 'Finalizada' } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    mockRepo.save.mockResolvedValue({ ...order, currentStatus: 'Entregue' });
    const result = await service.delivered(customer, 1);
    expect(result.currentStatus).toBe('Entregue');
  });

  it('não deve permitir confirmar entrega se não for o cliente da OS', async () => {
    const order = { idServiceOrder: 1, customer: { id: 99 }, vehicle: { id: 123 } } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.delivered({ id: 1 } as User, 1)).rejects.toThrow(ForbiddenException);
  });

  it('não deve permitir confirmar entrega se o veículo não existir', async () => {
    const customer = { id: 1, type: 'cliente' } as User;
    const order = { idServiceOrder: 1, customer, vehicle: null } as ServiceOrder;
    mockRepo.findOne.mockResolvedValue(order);
    await expect(service.delivered(customer, 1)).rejects.toThrow(NotFoundException);
  });
});
