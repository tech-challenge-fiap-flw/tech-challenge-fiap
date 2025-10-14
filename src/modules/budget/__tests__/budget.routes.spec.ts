import request from 'supertest';
import express from 'express';

let serviceCreateMock: jest.Mock;
let serviceFindMock: jest.Mock;
let authMiddlewareMock: jest.Mock;

describe('budget.routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    serviceCreateMock = jest.fn();
    serviceFindMock = jest.fn();
    authMiddlewareMock = jest.fn((req, _res, next) => {
      (req as any).user = { sub: 1, type: 'admin' };
      next();
    });

    jest.doMock('../../auth/AuthMiddleware', () => ({
      authMiddleware: authMiddlewareMock
    }));

    jest.doMock('../application/BudgetService', () => ({
      BudgetService: class {
        create = serviceCreateMock;
        findById = serviceFindMock;
      }
    }));

    jest.doMock('../infra/BudgetMySqlRepository', () => ({BudgetMySqlRepository: class {} }));
    jest.doMock('../../budget-vehicle-part/infra/BudgetVehiclePartMySqlRepository', () => ({ BudgetVehiclePartMySqlRepository: class {} }));
    jest.doMock('../../budget-vehicle-part/application/BudgetVehiclePartService', () => ({ BudgetVehiclePartService: class {} }));
    jest.doMock('../../budget-vehicle-service/infra/BudgetVehicleServiceMySqlRepository', () => ({ BudgetVehicleServiceMySqlRepository: class {} }));
    jest.doMock('../../budget-vehicle-service/application/BudgetVehicleServiceService', () => ({ BudgetVehicleServiceService: class {} }));
    jest.doMock('../../vehicle-part/infra/VehiclePartMySqlRepository', () => ({ VehiclePartMySqlRepository: class {} }));
    jest.doMock('../../vehicle-part/application/VehiclePartService', () => ({ VehiclePartService: class {} }));
    jest.doMock('../../vehicle-service/infra/VehicleServiceMySqlRepository', () => ({ VehicleServiceMySqlRepository: class {} }));
    jest.doMock('../../vehicle-service/application/VehicleServiceService', () => ({ VehicleServiceService: class {} }));
    jest.doMock('../../user/infra/UserMySqlRepository', () => ({ UserMySqlRepository: class {} }));
    jest.doMock('../../user/infra/BcryptPasswordHasher', () => ({ BcryptPasswordHasher: class {} }));
    jest.doMock('../../user/application/UserService', () => ({ UserService: class {} }));
    jest.doMock('../../diagnosis/infra/DiagnosisMySqlRepository', () => ({ DiagnosisMySqlRepository: class {} }));
    jest.doMock('../../diagnosis/application/DiagnosisService', () => ({ DiagnosisService: class {} }));
    jest.doMock('../../vehicle/infra/VehicleMySqlRepository', () => ({ VehicleMySqlRepository: class {} }));
    jest.doMock('../../vehicle/application/VehicleService', () => ({ VehicleService: class {} }));
    jest.doMock('../../service-order-history/infra/ServiceOrderHistoryMongoRepository', () => ({ ServiceOrderHistoryMongoRepository: class {} }));
    jest.doMock('../../service-order-history/application/ServiceOrderHistoryService', () => ({ ServiceOrderHistoryService: class {} }));

    const { budgetRouter } = await import('../http/budget.routes');

    app = express();
    app.use(express.json());
    app.use('/budgets', budgetRouter);
  });

  it('POST /budgets deve criar e retornar 201', async () => {
    serviceCreateMock.mockResolvedValue({
      id: 1,
      description: 'd',
      ownerId: 1,
      diagnosisId: 2,
      total: 100,
      creationDate: new Date(),
      deletedAt: null
    });

    const res = await request(app)
      .post('/budgets')
      .send({
        description: 'descrição teste',
        ownerId: 1,
        diagnosisId: 2,
        vehicleParts: [],
        vehicleServicesIds: []
      });

    expect(authMiddlewareMock).toHaveBeenCalled();
    expect(serviceCreateMock).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });

  it('POST /budgets deve retornar 400 em validação inválida', async () => {
    const res = await request(app)
      .post('/budgets')
      .send({
        description: 'abc',
        ownerId: 1,
        diagnosisId: 2,
        vehicleParts: []
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(serviceCreateMock).not.toHaveBeenCalled();
  });

  it('GET /budgets/:id deve retornar 200', async () => {
    serviceFindMock.mockResolvedValue({
      id: 9,
      description: 'd',
      ownerId: 1,
      diagnosisId: 2,
      total: 0,
      creationDate: new Date(),
      deletedAt: null
    });

    const res = await request(app).get('/budgets/9');

    expect(serviceFindMock).toHaveBeenCalledWith('9');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(9);
  });
});
