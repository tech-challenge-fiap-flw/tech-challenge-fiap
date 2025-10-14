import request from 'supertest';
import express from 'express';

let serviceCreateMock: jest.Mock;
let executionTimeMock: jest.Mock;
let averageExecutionTimeMock: jest.Mock;
let authMock: jest.Mock;
let Exceptions: any;

describe('service-order.routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

  serviceCreateMock = jest.fn();
  executionTimeMock = jest.fn();
  averageExecutionTimeMock = jest.fn();
    authMock = jest.fn((_req, _res, next) => { (_req as any).user = { sub: 1 }; next(); });

    jest.doMock('../../auth/AuthMiddleware', () => ({ authMiddleware: authMock }));
    jest.doMock('../application/ServiceOrderService', () => ({ ServiceOrderService: class { create = serviceCreateMock; getExecutionTimeById = executionTimeMock; getAverageExecutionTime = averageExecutionTimeMock; } }));

    const emptyClass = class {};
    jest.doMock('../infra/ServiceOrderMySqlRepository', () => ({ ServiceOrderMySqlRepository: emptyClass }));
    jest.doMock('../../diagnosis/infra/DiagnosisMySqlRepository', () => ({ DiagnosisMySqlRepository: emptyClass }));
    jest.doMock('../../diagnosis/application/DiagnosisService', () => ({ DiagnosisService: emptyClass }));
    jest.doMock('../../vehicle/infra/VehicleMySqlRepository', () => ({ VehicleMySqlRepository: emptyClass }));
    jest.doMock('../../vehicle/application/VehicleService', () => ({ VehicleService: emptyClass }));
    jest.doMock('../../user/infra/UserMySqlRepository', () => ({ UserMySqlRepository: emptyClass }));
    jest.doMock('../../user/infra/BcryptPasswordHasher', () => ({ BcryptPasswordHasher: emptyClass }));
    jest.doMock('../../user/application/UserService', () => ({ UserService: emptyClass }));
    jest.doMock('../../budget/infra/BudgetMySqlRepository', () => ({ BudgetMySqlRepository: emptyClass }));
    jest.doMock('../../budget/application/BudgetService', () => ({ BudgetService: emptyClass }));
    jest.doMock('../../vehicle-part/infra/VehiclePartMySqlRepository', () => ({ VehiclePartMySqlRepository: emptyClass }));
    jest.doMock('../../vehicle-part/application/VehiclePartService', () => ({ VehiclePartService: emptyClass }));
    jest.doMock('../../budget-vehicle-part/infra/BudgetVehiclePartMySqlRepository', () => ({ BudgetVehiclePartMySqlRepository: emptyClass }));
    jest.doMock('../../budget-vehicle-part/application/BudgetVehiclePartService', () => ({ BudgetVehiclePartService: emptyClass }));
    jest.doMock('../../vehicle-service/infra/VehicleServiceMySqlRepository', () => ({ VehicleServiceMySqlRepository: emptyClass }));
    jest.doMock('../../vehicle-service/application/VehicleServiceService', () => ({ VehicleServiceService: emptyClass }));
    jest.doMock('../../budget-vehicle-service/infra/BudgetVehicleServiceMySqlRepository', () => ({ BudgetVehicleServiceMySqlRepository: emptyClass }));
    jest.doMock('../../budget-vehicle-service/application/BudgetVehicleServiceService', () => ({ BudgetVehicleServiceService: emptyClass }));
    jest.doMock('../../service-order-history/infra/ServiceOrderHistoryMongoRepository', () => ({ ServiceOrderHistoryMongoRepository: emptyClass }));
    jest.doMock('../../service-order-history/application/ServiceOrderHistoryService', () => ({ ServiceOrderHistoryService: emptyClass }));

    const { serviceOrderRouter } = await import('../http/service-order.routes');
    Exceptions = await import('../../../shared/application/ServerException');

    app = express();
    app.use(express.json());
    app.use('/service-orders', serviceOrderRouter);
  });

  it('POST /service-orders cria e retorna 201', async () => {
    serviceCreateMock.mockResolvedValue({ id: 1, description: 'd', customerId: 1, vehicleId: 2, currentStatus: 'Recebida' });
    const res = await request(app)
      .post('/service-orders')
      .send({ description: 'desc', vehicleId: 2 });
    expect(authMock).toHaveBeenCalled();
    expect(serviceCreateMock).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });

  it('POST /service-orders retorna 400 em validação', async () => {
    const res = await request(app)
      .post('/service-orders')
      .send({ vehicleId: 2 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(serviceCreateMock).not.toHaveBeenCalled();
  });

  it('GET /service-orders/:id/execution-time retorna tempo', async () => {
    executionTimeMock.mockResolvedValue({ executionTimeMs: 5000 });
    const res = await request(app).get('/service-orders/10/execution-time');
    expect(res.status).toBe(200);
    expect(res.body.executionTimeMs).toBe(5000);
  });

  it('GET /service-orders/:id/execution-time retorna 400 quando erro de negócio', async () => {
    executionTimeMock.mockRejectedValue(new Exceptions.BadRequestServerException('Histórico da OS não encontrado.'));
    const res = await request(app).get('/service-orders/11/execution-time');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Histórico da OS não encontrado.');
  });

  it('GET /service-orders/execution-time/average retorna média', async () => {
    averageExecutionTimeMock.mockResolvedValue({ averageExecutionTimeMs: 3000 });
    const res = await request(app).get('/service-orders/execution-time/average');
    expect(res.status).toBe(200);
    expect(res.body.averageExecutionTimeMs).toBe(3000);
  });

  it('GET /service-orders/execution-time/average retorna 400 quando erro de negócio', async () => {
    averageExecutionTimeMock.mockRejectedValue(new Exceptions.BadRequestServerException('Nenhuma OS ativa encontrada.'));
    const res = await request(app).get('/service-orders/execution-time/average');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nenhuma OS ativa encontrada.');
  });
});
