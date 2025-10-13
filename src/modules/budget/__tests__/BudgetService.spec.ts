import { BudgetService } from '../application/BudgetService';
import { BudgetEntity } from '../domain/Budget';
import { NotFoundServerException, ForbiddenServerException } from '../../../shared/application/ServerException';

function makeDeps() {
  return {
    repo: {
      transaction: (fn: any) => fn(),
      create: jest.fn(),
      findById: jest.fn()
    },
    userService: {
      findById: jest.fn()
    },
    diagnosisService: {
      findById: jest.fn()
    },
    vehiclePartService: {
      findById: jest.fn(),
      updateVehiclePart: jest.fn()
    },
    budgetVehiclePartService: {
      createMany: jest.fn()
    },
    vehicleServiceService: {
      findByIds: jest.fn()
    },
    budgetVehicleServiceService: {
      createMany: jest.fn()
    },
    historyService: {
      add: jest.fn()
    }
  };
}

describe('BudgetService', () => {
  it('create sucesso calcula total e chama dependências', async () => {
    const d = makeDeps();

    d.userService.findById.mockResolvedValue({});
    d.diagnosisService.findById.mockResolvedValue({});
    d.vehicleServiceService.findByIds.mockResolvedValue([
      { id: 1, price: 100 }
    ]);
    d.vehiclePartService.findById.mockResolvedValue({
      id: 10,
      quantity: 5,
      price: 20
    });
    d.repo.create.mockImplementation((e: any) => 
      Promise.resolve(
        BudgetEntity.restore({ ...e.toJSON(), id: 77 })
      )
    );

    const service = new BudgetService(
      d.repo as any,
      d.userService as any,
      d.diagnosisService as any,
      d.vehiclePartService as any,
      d.budgetVehiclePartService as any,
      d.vehicleServiceService as any,
      d.budgetVehicleServiceService as any,
      d.historyService as any
    );

    const res = await service.create({
      description: 'orcamento',
      ownerId: 1,
      diagnosisId: 2,
      vehicleParts: [
        { vehiclePartId: 10, quantity: 2 }
      ],
      vehicleServicesIds: [1]
    });

    expect(res.total).toBe((20 * 2) + 100);

    expect(d.budgetVehiclePartService.createMany).toHaveBeenCalledWith({
      budgetId: 77,
      parts: [
        { vehiclePartId: 10, quantity: 2 }
      ]
    });

    expect(d.budgetVehicleServiceService.createMany).toHaveBeenCalledWith({
      budgetId: 77,
      vehicleServiceIds: [1]
    });
  });

  it('create lança NotFound se algum serviço inexistente', async () => {
    const d = makeDeps();

    d.userService.findById.mockResolvedValue({});
    d.diagnosisService.findById.mockResolvedValue({});
    d.vehicleServiceService.findByIds.mockResolvedValue([]);

    const service = new BudgetService(
      d.repo as any,
      d.userService as any,
      d.diagnosisService as any,
      d.vehiclePartService as any,
      d.budgetVehiclePartService as any,
      d.vehicleServiceService as any,
      d.budgetVehicleServiceService as any,
      d.historyService as any
    );

    await expect(
      service.create({
        description: 'x',
        ownerId: 1,
        diagnosisId: 2,
        vehicleParts: [],
        vehicleServicesIds: [1]
      })
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });

  it('create lança Forbidden se quantidade insuficiente', async () => {
    const d = makeDeps();

    d.userService.findById.mockResolvedValue({});
    d.diagnosisService.findById.mockResolvedValue({});
    d.vehicleServiceService.findByIds.mockResolvedValue([]);
    d.vehiclePartService.findById.mockResolvedValue({
      id: 10,
      quantity: 1,
      price: 10
    });

    const service = new BudgetService(
      d.repo as any,
      d.userService as any,
      d.diagnosisService as any,
      d.vehiclePartService as any,
      d.budgetVehiclePartService as any,
      d.vehicleServiceService as any,
      d.budgetVehicleServiceService as any,
      d.historyService as any
    );

    await expect(
      service.create({
        description: 'y',
        ownerId: 1,
        diagnosisId: 2,
        vehicleParts: [
          { vehiclePartId: 10, quantity: 2 }
        ]
      })
    ).rejects.toBeInstanceOf(ForbiddenServerException);
  });

  it('findById retorna budget JSON', async () => {
    const d = makeDeps();

    const entity = BudgetEntity.create({
      description: 'a',
      ownerId: 1,
      diagnosisId: 2
    });

    d.repo.findById.mockResolvedValue(entity);

    const service = new BudgetService(
      d.repo as any,
      d.userService as any,
      d.diagnosisService as any,
      d.vehiclePartService as any,
      d.budgetVehiclePartService as any,
      d.vehicleServiceService as any,
      d.budgetVehicleServiceService as any,
      d.historyService as any
    );

    const res = await service.findById(1);

    expect(res.description).toBe('a');
  });

  it('findById lança NotFound quando ausente', async () => {
    const d = makeDeps();

    d.repo.findById.mockResolvedValue(null);

    const service = new BudgetService(
      d.repo as any,
      d.userService as any,
      d.diagnosisService as any,
      d.vehiclePartService as any,
      d.budgetVehiclePartService as any,
      d.vehicleServiceService as any,
      d.budgetVehicleServiceService as any,
      d.historyService as any
    );

    await expect(
      service.findById(1)
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });
});
