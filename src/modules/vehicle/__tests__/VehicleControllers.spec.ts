import { CreateVehicleController } from '../http/controllers/CreateVehicleController';
import { GetVehicleController } from '../http/controllers/GetVehicleController';
import { UpdateVehicleController } from '../http/controllers/UpdateVehicleController';
import { DeleteVehicleController } from '../http/controllers/DeleteVehicleController';
import { ListVehiclesController } from '../http/controllers/ListVehiclesController';

function mockReq(
  body: any = {},
  params: any = {},
  query: any = {},
  user: any = { sub: 1 }
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
    createVehicle: jest.fn(),
    findById: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn()
  };
}

describe('Vehicle Controllers', () => {
  it('Create 201', async () => {
    const svc = mockService();

    svc.createVehicle.mockResolvedValue({
      id: 1,
      idPlate: 'ABC1234'
    });

    const controller = new CreateVehicleController(svc as any);

    const res = await controller.handle(
      mockReq({
        idPlate: 'ABC1234',
        type: 'car',
        model: 'M',
        brand: 'B',
        manufactureYear: 2023,
        modelYear: 2024,
        color: 'red',
        ownerId: 1
      })
    );

    expect(res.status).toBe(201);
  });

  it('Create 400 validation', async () => {
    const svc = mockService();

    const controller = new CreateVehicleController(svc as any);

    await expect(
      controller.handle(
        mockReq({ type: 'car' })
      )
    ).rejects.toThrow('Validation failed');
  });

  it('Get 200', async () => {
    const svc = mockService();

    svc.findById.mockResolvedValue({ id: 2 });

    const controller = new GetVehicleController(svc as any);

    const res = await controller.handle(
      mockReq({}, { id: 2 })
    );

    expect(res.status).toBe(200);
  });

  it('Update 200', async () => {
    const svc = mockService();

    svc.updateVehicle.mockResolvedValue({
      id: 3,
      color: 'blue'
    });

    const controller = new UpdateVehicleController(svc as any);

    const res = await controller.handle(
      mockReq({ color: 'blue' }, { id: 3 })
    );

    expect(res.status).toBe(200);
    expect(res.body.color).toBe('blue');
  });

  it('Update 400 validation', async () => {
    const svc = mockService();

    const controller = new UpdateVehicleController(svc as any);

    await expect(
      controller.handle(
        mockReq({ manufactureYear: 'invalid' }, { id: 3 })
      )
    ).rejects.toThrow('Validation failed');
  });

  it('Delete 204', async () => {
    const svc = mockService();

    const controller = new DeleteVehicleController(svc as any);

    const res = await controller.handle(
      mockReq({}, { id: 4 })
    );

    expect(res.status).toBe(204);
  });

  it('List 200 retorna paginação', async () => {
    const svc = mockService();

    svc.list.mockResolvedValue([{ id: 1 }]);
    svc.countAll.mockResolvedValue(1);

    const controller = new ListVehiclesController(svc as any);

    const res = await controller.handle(
      mockReq({}, {}, { page: '1', limit: '10' })
    );

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});
