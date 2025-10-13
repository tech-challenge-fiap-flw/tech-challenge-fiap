import request from 'supertest';
import express from 'express';

describe('budget-vehicle-part.routes (custom lightweight harness)', () => {
  let app: express.Express;
  let serviceMock: any;

  beforeEach(async () => {
    jest.resetModules();

    app = express();
    app.use(express.json());

    serviceMock = {
      createMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          budgetId: 1,
          vehiclePartId: 10,
          quantity: 2
        }
      ])
    };

    const { CreateBudgetVehiclePartController } = await import('../http/controllers/CreateBudgetVehiclePartController');
    const { adaptExpress } = await import('../../../shared/http/Controller');

    const auth = (_req: any, _res: any, next: any) => {
      next();
    };

    const router = express.Router();

    router.post(
      '/',
      auth,
      adaptExpress(new CreateBudgetVehiclePartController(serviceMock))
    );

    app.use('/budget-vehicle-parts', router);
  });

  it('POST /budget-vehicle-parts should create parts and return 201', async () => {
    const res = await request(app)
      .post('/budget-vehicle-parts')
      .send({
        budgetId: 1,
        parts: [
          {
            vehiclePartId: 10,
            quantity: 2
          }
        ]
      });

    expect(res.status).toBe(201);

    expect(serviceMock.createMany).toHaveBeenCalledWith({
      budgetId: 1,
      parts: [
        {
          vehiclePartId: 10,
          quantity: 2
        }
      ]
    });

    expect(res.body).toEqual([
      {
        id: 1,
        budgetId: 1,
        vehiclePartId: 10,
        quantity: 2
      }
    ]);
  });

  it('POST /budget-vehicle-parts should return 400 on validation error', async () => {
    const res = await request(app)
      .post('/budget-vehicle-parts')
      .send({
        budgetId: 1,
        parts: []
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(serviceMock.createMany).not.toHaveBeenCalled();
  });
});

describe('budget-vehicle-part.routes (actual file import)', () => {
  let app: express.Express;
  let createManyMock: jest.Mock;
  let authMock: jest.Mock;

  beforeEach(async () => {
    jest.resetModules();

    app = express();
    app.use(express.json());

    authMock = jest.fn((_req, _res, next) => {
      next();
    });

    jest.doMock('../../auth/AuthMiddleware', () => ({
      authMiddleware: authMock
    }));

    const repoCreateSpy = jest.fn();

    class RepoMock {
      create = repoCreateSpy;
    }

    jest.doMock('../infra/BudgetVehiclePartMySqlRepository', () => ({
      BudgetVehiclePartMySqlRepository: RepoMock
    }));

    createManyMock = jest.fn().mockResolvedValue([
      {
        id: 9,
        budgetId: 2,
        vehiclePartId: 33,
        quantity: 5
      }
    ]);

    class ServiceMock {
      constructor(_repo: any) {}

      createMany = createManyMock;
    }

    jest.doMock('../application/BudgetVehiclePartService', () => ({
      BudgetVehiclePartService: ServiceMock
    }));

    const { budgetVehiclePartRouter } = await import('../http/budget-vehicle-part.routes');

    app.use('/budget-vehicle-parts', budgetVehiclePartRouter);
  });

  it('should call auth middleware and createMany on valid request', async () => {
    const res = await request(app)
      .post('/budget-vehicle-parts')
      .send({
        budgetId: 2,
        parts: [
          {
            vehiclePartId: 33,
            quantity: 5
          }
        ]
      });

    expect(authMock).toHaveBeenCalledTimes(1);

    expect(createManyMock).toHaveBeenCalledWith({
      budgetId: 2,
      parts: [
        {
          vehiclePartId: 33,
          quantity: 5
        }
      ]
    });

    expect(res.status).toBe(201);

    expect(res.body).toEqual([
      {
        id: 9,
        budgetId: 2,
        vehiclePartId: 33,
        quantity: 5
      }
    ]);
  });

  it('should return 400 when quantity invalid (0)', async () => {
    const res = await request(app)
      .post('/budget-vehicle-parts')
      .send({
        budgetId: 2,
        parts: [
          {
            vehiclePartId: 33,
            quantity: 0
          }
        ]
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(createManyMock).not.toHaveBeenCalled();
  });

  it('should return 500 when service throws unexpected error', async () => {
    createManyMock.mockRejectedValueOnce(new Error('boom'));

    const res = await request(app)
      .post('/budget-vehicle-parts')
      .send({
        budgetId: 2,
        parts: [
          {
            vehiclePartId: 33,
            quantity: 5
          }
        ]
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
