import request from 'supertest';
import express from 'express';

let serviceMocks: any;
let authMock: jest.Mock;

describe('vehicle-service.routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    authMock = jest.fn((_req, _res, next) => {
      next();
    });

    serviceMocks = {
      createVehicleService: jest.fn(),
      findById: jest.fn(),
      updateVehicleService: jest.fn(),
      deleteVehicleService: jest.fn(),
      list: jest.fn(),
      countAll: jest.fn()
    };

    jest.doMock('../../auth/AuthMiddleware', () => {
      return { authMiddleware: authMock };
    });

    jest.doMock('../application/VehicleServiceService', () => {
      return {
        VehicleServiceService: class {
          constructor() {
            return serviceMocks;
          }
        }
      };
    });

    jest.doMock('../infra/VehicleServiceMySqlRepository', () => {
      return {
        VehicleServiceMySqlRepository: class {}
      };
    });

    const { vehicleServiceRouter } = await import('../http/vehicle-service.routes');

    app = express();
    app.use(express.json());
    app.use('/vehicle-services', vehicleServiceRouter);
  });

  it('POST /vehicle-services 201', async () => {
    serviceMocks.createVehicleService.mockResolvedValue({
      id: 1,
      name: 'S',
      price: 10,
      description: null
    });

    const res = await request(app)
      .post('/vehicle-services')
      .send({
        name: 'S',
        price: 10,
        description: null
      });

    expect(res.status).toBe(201);
    expect(serviceMocks.createVehicleService).toHaveBeenCalled();
  });

  it('POST /vehicle-services 400 validation', async () => {
    const res = await request(app)
      .post('/vehicle-services')
      .send({
        price: 10
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(serviceMocks.createVehicleService).not.toHaveBeenCalled();
  });

  it('GET /vehicle-services/:id 200', async () => {
    serviceMocks.findById.mockResolvedValue({
      id: 5,
      name: 'X',
      price: 20,
      description: null
    });

    const res = await request(app)
      .get('/vehicle-services/5');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
  });

  it('PUT /vehicle-services/:id 200', async () => {
    serviceMocks.updateVehicleService.mockResolvedValue({
      id: 5,
      name: 'Y',
      price: 30,
      description: null
    });

    const res = await request(app)
      .put('/vehicle-services/5')
      .send({
        name: 'Y'
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Y');
  });

  it('PUT /vehicle-services/:id 400 validation', async () => {
    const res = await request(app)
      .put('/vehicle-services/5')
      .send({
        price: 'invalid'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('DELETE /vehicle-services/:id 204', async () => {
    serviceMocks.deleteVehicleService.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/vehicle-services/7');

    expect(res.status).toBe(204);
  });

  it('GET /vehicle-services lista paginação', async () => {
    serviceMocks.list.mockResolvedValue([
      {
        id: 1,
        name: 'A',
        price: 1,
        description: null
      }
    ]);

    serviceMocks.countAll.mockResolvedValue(1);

    const res = await request(app)
      .get('/vehicle-services?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});
