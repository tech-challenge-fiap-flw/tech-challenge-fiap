import request from 'supertest';
import express from 'express';

describe('budget-vehicle-service.routes', () => {
  const app = express();
  app.use(express.json());

  let serviceMocks: any;

  beforeEach(async () => {
    jest.resetModules();

    serviceMocks = {
      create: jest.fn().mockResolvedValue({
        id: 1,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 0
      }),
      update: jest.fn().mockResolvedValue({
        id: 1,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 10
      }),
      delete: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue({
        id: 1,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 0
      })
    };

    const repoMock = jest.fn();

    jest.doMock('../infra/BudgetVehicleServiceMySqlRepository', () => ({
      BudgetVehicleServiceMySqlRepository: repoMock
    }));

    const { budgetVehicleServiceRouter } = await import('../http/budget-vehicle-service.routes');

    app._router = undefined as any;

    const fresh = express();
    fresh.use(express.json());

    const { CreateBudgetVehicleServiceController } = await import('../http/controllers/CreateBudgetVehicleServiceController');
    const { UpdateBudgetVehicleServiceController } = await import('../http/controllers/UpdateBudgetVehicleServiceController');
    const { GetBudgetVehicleServiceController } = await import('../http/controllers/GetBudgetVehicleServiceController');
    const { DeleteBudgetVehicleServiceController } = await import('../http/controllers/DeleteCurrentUserController');
    const { adaptExpress } = await import('../../../shared/http/Controller');

    const auth = (_req: any, _res: any, next: any) => {
      next();
    };

    const router = express.Router();

    router.post(
      '/',
      adaptExpress(new CreateBudgetVehicleServiceController(serviceMocks))
    );

    router.put(
      '/:id',
      auth,
      adaptExpress(new UpdateBudgetVehicleServiceController(serviceMocks))
    );

    router.delete(
      '/:id',
      auth,
      adaptExpress(new DeleteBudgetVehicleServiceController(serviceMocks))
    );

    router.get(
      '/:id',
      auth,
      adaptExpress(new GetBudgetVehicleServiceController(serviceMocks))
    );

    fresh.use('/budget-vehicle-services', router);

    (app as any)._router = (fresh as any)._router;
  });

  it('POST /budget-vehicle-services should create with default price', async () => {
    const res = await request(app)
      .post('/budget-vehicle-services')
      .send({
        budgetId: 1,
        vehicleServiceId: 2
      });

    expect(res.status).toBe(201);
    expect(serviceMocks.create).toHaveBeenCalled();
    expect(res.body.price).toBe(0);
  });

  it('PUT /budget-vehicle-services/:id should update', async () => {
    const res = await request(app)
      .put('/budget-vehicle-services/1')
      .send({
        budgetId: 1,
        vehicleServiceId: 2,
        price: 10
      });

    expect(res.status).toBe(200);
    expect(serviceMocks.update).toHaveBeenCalledWith(
      1,
      {
        budgetId: 1,
        vehicleServiceId: 2,
        price: 10
      }
    );
  });

  it('DELETE /budget-vehicle-services/:id should delete', async () => {
    const res = await request(app)
      .delete('/budget-vehicle-services/1');

    expect(res.status).toBe(204);
    expect(serviceMocks.delete).toHaveBeenCalledWith(1);
  });

  it('GET /budget-vehicle-services/:id should get by id', async () => {
    const res = await request(app)
      .get('/budget-vehicle-services/1');

    expect(res.status).toBe(200);
    expect(serviceMocks.findById).toHaveBeenCalledWith(1);
  });

  it('GET /budget-vehicle-services/:id should handle not found', async () => {
    const { NotFoundServerException } = await import('../../../shared/application/ServerException');
    serviceMocks.findById.mockRejectedValue(
      new NotFoundServerException('Budget Vehicle Service not found')
    );

    const res = await request(app).get('/budget-vehicle-services/99');

    expect(res.status).toBe(404);
  });
});
