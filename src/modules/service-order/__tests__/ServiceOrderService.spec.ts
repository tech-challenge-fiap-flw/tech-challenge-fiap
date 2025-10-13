import { ServiceOrderService } from '../application/ServiceOrderService';
import { ServiceOrderEntity } from '../domain/ServiceOrder';
import { ServiceOrderStatus } from '../../../shared/ServiceOrderStatus';
import { NotFoundServerException, BadRequestServerException, ForbiddenServerException } from '../../../shared/application/ServerException';

function makeRepo() {
  return {
    transaction: (fn: any) => {
      return fn();
    },
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findActiveByBudgetId: jest.fn(),
  };
}

function makeDeps() {
  return {
    repo: makeRepo(),
    diagnosisService: {
      create: jest.fn()
    },
    budgetService: {
      create: jest.fn(),
      findById: jest.fn()
    },
    budgetVehiclePartService: {
      listByBudget: jest.fn()
    },
    vehiclePartService: {
      findById: jest.fn(),
      updateVehiclePart: jest.fn()
    },
    historyService: {
      logStatusChange: jest.fn()
    },
  };
}

describe('ServiceOrderService', () => {
  const user = { sub: 1 } as any;
  const mechanic = { sub: 2 } as any;

  it('create com autoDiagnosis gera diagnosis e budget', async () => {
    const d = makeDeps();

    d.diagnosisService.create.mockResolvedValue({ id: 10 });
    d.budgetService.create.mockResolvedValue({ id: 20 });

    const entity = ServiceOrderEntity.create({
      description: 'x',
      budgetId: null,
      customerId: 1,
      vehicleId: 3,
      mechanicId: null
    });

    d.repo.create.mockResolvedValue(entity);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.create(user, {
      description: 'desc',
      vehicleId: 3,
      vehicleParts: [],
      vehicleServicesIds: [5]
    });

    expect(d.diagnosisService.create).toHaveBeenCalled();
    expect(d.budgetService.create).toHaveBeenCalled();
    expect(res.id).toBeDefined();
  });

  it('create usando budgetId existente chama findById', async () => {
    const d = makeDeps();

    d.budgetService.findById.mockResolvedValue({ id: 30 });

    const entity = ServiceOrderEntity.create({
      description: 'y',
      budgetId: 30,
      customerId: 1,
      vehicleId: 3,
      mechanicId: null
    });

    d.repo.create.mockResolvedValue(entity);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await service.create(user, {
      description: 'desc',
      vehicleId: 3,
      budgetId: 30
    });

    expect(d.budgetService.findById).toHaveBeenCalledWith(30);
  });

  it('findById lança NotFound', async () => {
    const d = makeDeps();

    d.repo.findById.mockResolvedValue(null);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await expect(service.findById(1)).rejects.toBeInstanceOf(NotFoundServerException);
  });

  it('accept com accept=true atualiza status', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.create({
      description: 'a',
      budgetId: null,
      customerId: 1,
      vehicleId: 1,
      mechanicId: null
    });

    d.repo.findById.mockResolvedValue(entity);

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        mechanicId: mechanic.sub,
        currentStatus: ServiceOrderStatus.EM_DIAGNOSTICO
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.accept(mechanic, 1, { accept: true });

    expect(d.repo.update).toHaveBeenCalled();
    expect(res.currentStatus).toBe(ServiceOrderStatus.RECEBIDA);
  });

  it('accept com accept=false devolve peças se houver budget', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.create({
      description: 'b',
      budgetId: 9,
      customerId: 1,
      vehicleId: 1,
      mechanicId: null
    });

    d.repo.findById.mockResolvedValue(entity);

    d.budgetVehiclePartService.listByBudget.mockResolvedValue([
      { vehiclePartId: 50, quantity: 2 }
    ]);

    d.vehiclePartService.findById.mockResolvedValue({
      id: 50,
      quantity: 5
    });

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        mechanicId: mechanic.sub,
        currentStatus: ServiceOrderStatus.RECUSADA
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await service.accept(mechanic, 1, { accept: false });

    expect(d.vehiclePartService.updateVehiclePart).toHaveBeenCalledWith(50, { quantity: 7 });
  });

  it('startRepair exige status AGUARDANDO_INICIO', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'c',
        budgetId: 1,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO,
      id: 10
    });

    d.repo.findById.mockResolvedValue(entity);

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        currentStatus: ServiceOrderStatus.EM_EXECUCAO
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.startRepair(mechanic, 10);

    expect(res.currentStatus).toBe(ServiceOrderStatus.EM_EXECUCAO);
  });

  it('startRepair lança BadRequest se status inválido', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'd',
        budgetId: 1,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      currentStatus: ServiceOrderStatus.RECEBIDA,
      id: 10
    });

    d.repo.findById.mockResolvedValue(entity);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await expect(service.startRepair(mechanic, 10)).rejects.toBeInstanceOf(BadRequestServerException);
  });

  it('finishRepair exige status EM_EXECUCAO', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'e',
        budgetId: 1,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      currentStatus: ServiceOrderStatus.EM_EXECUCAO,
      id: 10
    });

    d.repo.findById.mockResolvedValue(entity);

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        currentStatus: ServiceOrderStatus.FINALIZADA
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.finishRepair(mechanic, 10);

    expect(res.currentStatus).toBe(ServiceOrderStatus.FINALIZADA);
  });

  it('finishRepair lança BadRequest se status inválido', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'f',
        budgetId: 1,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      currentStatus: ServiceOrderStatus.AGUARDANDO_INICIO,
      id: 10
    });

    d.repo.findById.mockResolvedValue(entity);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await expect(service.finishRepair(mechanic, 10)).rejects.toBeInstanceOf(BadRequestServerException);
  });

  it('delivered atualiza para ENTREGUE', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'g',
        budgetId: 1,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      currentStatus: ServiceOrderStatus.FINALIZADA,
      id: 10
    });

    d.repo.findById.mockResolvedValue(entity);

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        currentStatus: ServiceOrderStatus.ENTREGUE
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.delivered(mechanic, 10);

    expect(res.currentStatus).toBe(ServiceOrderStatus.ENTREGUE);
  });

  it('assignBudget cria diagnosis e budget e atualiza para AGUARDANDO_APROVACAO', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'h',
        budgetId: null,
        customerId: 1,
        vehicleId: 2,
        mechanicId: mechanic.sub
      }).toJSON(),
      id: 15
    });

    d.repo.findById.mockResolvedValue(entity);

    d.diagnosisService.create.mockResolvedValue({ id: 5 });
    d.budgetService.create.mockResolvedValue({ id: 8 });

    d.repo.update.mockResolvedValue(
      ServiceOrderEntity.restore({
        ...entity.toJSON(),
        budgetId: 8,
        currentStatus: ServiceOrderStatus.AGUARDANDO_APROVACAO
      })
    );

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    const res = await service.assignBudget(mechanic, 15, {
      description: 'abcde',
      vehicleParts: [],
      vehicleServicesIds: []
    });

    expect(res.currentStatus).toBe(ServiceOrderStatus.AGUARDANDO_APROVACAO);
  });

  it('assignBudget lança Forbidden se mecânico diferente', async () => {
    const d = makeDeps();

    const entity = ServiceOrderEntity.restore({
      ...ServiceOrderEntity.create({
        description: 'i',
        budgetId: null,
        customerId: 1,
        vehicleId: 2,
        mechanicId: 999
      }).toJSON(),
      id: 15
    });

    d.repo.findById.mockResolvedValue(entity);

    const service = new ServiceOrderService(
      d.repo as any,
      d.diagnosisService as any,
      d.budgetService as any,
      d.budgetVehiclePartService as any,
      d.vehiclePartService as any,
      d.historyService as any
    );

    await expect(
      service.assignBudget(mechanic, 15, {
        description: 'abcde',
        vehicleParts: [],
        vehicleServicesIds: []
      })
    ).rejects.toBeInstanceOf(ForbiddenServerException);
  });
});
