import request from 'supertest';
import express from 'express';

let serviceMocks: any;
let authMock: jest.Mock;

describe('vehicle.routes', () => {
  let app: express.Express;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    authMock = jest.fn((_req, _res, next) => {
      next();
    });

    serviceMocks = {
      createVehicle: jest.fn(),
      findById: jest.fn(),
      updateVehicle: jest.fn(),
      deleteVehicle: jest.fn(),
      list: jest.fn(),
      countAll: jest.fn(),
    };

    jest.doMock('../../auth/AuthMiddleware', () => ({ authMiddleware: authMock }));
    jest.doMock('../../user/infra/UserMySqlRepository', () => ({ UserMySqlRepository: class {} }));
    jest.doMock('../../user/infra/BcryptPasswordHasher', () => ({ BcryptPasswordHasher: class {} }));
    jest.doMock('../../user/application/UserService', () => ({ UserService: class {} }));
    jest.doMock('../application/VehicleService', () => ({
      VehicleService: class {
        constructor() {
          return serviceMocks;
        }
      }
    }));

    jest.doMock('../infra/VehicleMySqlRepository', () => ({ VehicleMySqlRepository: class {} }));

    const { vehicleRouter } = await import('../http/vehicle.routes');

    app = express();
    app.use(express.json());
    app.use('/vehicles', vehicleRouter);
  });

  it('POST /vehicles 201', async () => {
    serviceMocks.createVehicle.mockResolvedValue({
      id: 1,
      idPlate: 'ABC1234'
    });

    const res = await request(app)
      .post('/vehicles')
      .send({
        idPlate: 'ABC1234',
        type: 'car',
        model: 'M',
        brand: 'B',
        manufactureYear: 2023,
        modelYear: 2024,
        color: 'red',
        ownerId: 1
      });

    expect(res.status).toBe(201);
    expect(serviceMocks.createVehicle).toHaveBeenCalled();
  });

  it('POST /vehicles 400 validation', async () => {
    const res = await request(app)
      .post('/vehicles')
      .send({
        type: 'car'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(serviceMocks.createVehicle).not.toHaveBeenCalled();
  });

  it('GET /vehicles/:id 200', async () => {
    serviceMocks.findById.mockResolvedValue({
      id: 5
    });

    const res = await request(app)
      .get('/vehicles/5');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
  });

  it('PUT /vehicles/:id 200', async () => {
    serviceMocks.updateVehicle.mockResolvedValue({
      id: 5,
      color: 'blue'
    });

    const res = await request(app)
      .put('/vehicles/5')
      .send({
        color: 'blue'
      });

    expect(res.status).toBe(200);
    expect(res.body.color).toBe('blue');
  });

  it('PUT /vehicles/:id 400 validation', async () => {
    const res = await request(app)
      .put('/vehicles/5')
      .send({
        manufactureYear: 'x'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('DELETE /vehicles/:id 204', async () => {
    serviceMocks.deleteVehicle.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/vehicles/7');

    expect(res.status).toBe(204);
  });

  it('GET /vehicles lista paginada', async () => {
    serviceMocks.list.mockResolvedValue([
      { id: 1 }
    ]);

    serviceMocks.countAll.mockResolvedValue(1);

    const res = await request(app)
      .get('/vehicles?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});
