import { CreateVehicleServiceController } from '../http/controllers/CreateVehicleServiceController';
import { GetVehicleServiceController } from '../http/controllers/GetVehicleServiceController';
import { UpdateVehicleServiceController } from '../http/controllers/UpdateVehicleServiceController';
import { DeleteVehicleServiceController } from '../http/controllers/DeleteVehicleServiceController';
import { ListVehicleServicesController } from '../http/controllers/ListVehicleServicesController';

function mockReq(
  body: any = {},
  params: any = {},
  query: any = {},
  user?: any
) {
  return {
    body,
    params,
    query,
    user,
    raw: { query }
  } as any;
}

function mockService() {
  return {
    createVehicleService: jest.fn(),
    findById: jest.fn(),
    updateVehicleService: jest.fn(),
    deleteVehicleService: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn()
  };
}

describe('VehicleService Controllers', () => {
  it('Create 201', async () => {
    const svc = mockService();

    svc.createVehicleService.mockResolvedValue({
      id: 1,
      name: 'N',
      price: 10,
      description: null
    });

    const controller = new CreateVehicleServiceController(svc as any);

    const res = await controller.handle(
      mockReq({ name: 'N', price: 10, description: null })
    );

    expect(res.status).toBe(201);
  });

  it('Create 400 validation', async () => {
    const svc = mockService();

    const controller = new CreateVehicleServiceController(svc as any);

    await expect(
      controller.handle(mockReq({ price: 10 }))
    ).rejects.toThrow('Validation failed');
  });

  it('Get 200', async () => {
    const svc = mockService();

    svc.findById.mockResolvedValue({
      id: 2,
      name: 'X',
      price: 5,
      description: null
    });

    const controller = new GetVehicleServiceController(svc as any);

    const res = await controller.handle(
      mockReq({}, { id: 2 })
    );

    expect(res.status).toBe(200);
  });

  it('Update 200', async () => {
    const svc = mockService();

    svc.updateVehicleService.mockResolvedValue({
      id: 3,
      name: 'U',
      price: 15,
      description: null
    });

    const controller = new UpdateVehicleServiceController(svc as any);

    const res = await controller.handle(
      mockReq({ name: 'U' }, { id: 3 })
    );

    expect(res.status).toBe(200);
  });

  it('Update 400 validation', async () => {
    const svc = mockService();

    const controller = new UpdateVehicleServiceController(svc as any);

    await expect(
      controller.handle(mockReq({ price: 'invalid' }, { id: 3 }))
    ).rejects.toThrow('Validation failed');
  });

  it('Delete 204', async () => {
    const svc = mockService();

    const controller = new DeleteVehicleServiceController(svc as any);

    const res = await controller.handle(
      mockReq({}, { id: 4 })
    );

    expect(res.status).toBe(204);
  });

  it('List 200', async () => {
    const svc = mockService();

    svc.list.mockResolvedValue([
      {
        id: 1,
        name: 'A',
        price: 1,
        description: null
      }
    ]);

    svc.countAll.mockResolvedValue(1);

    const controller = new ListVehicleServicesController(svc as any);

    const res = await controller.handle(
      mockReq({}, {}, { page: '1', limit: '10' })
    );

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});
