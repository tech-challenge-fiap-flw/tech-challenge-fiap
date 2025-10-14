import { CreateVehiclePartController } from '../http/controllers/CreateVehiclePartController';
import { UpdateVehiclePartController } from '../http/controllers/UpdateVehiclePartController';
import { GetVehiclePartController } from '../http/controllers/GetVehiclePartController';
import { DeleteVehiclePartController } from '../http/controllers/DeleteVehiclePartController';
import { ListVehiclePartsController } from '../http/controllers/ListVehiclePartsController';
import { serviceMock, makePartOutput } from './http_infra_mocks';
import { HttpError } from '../../../shared/http/HttpError';

const makeReq = (
  body: any = {},
  params: any = {},
  query: any = {}
) => {
  return {
    body,
    params,
    query,
    raw: { query }
  } as any;
};

describe('VehiclePart Controllers', () => {
  describe('CreateVehiclePartController', () => {
    it('cria peça válida', async () => {
      const service = serviceMock();
      const output = makePartOutput({ id: 10 });

      service.createVehiclePart.mockResolvedValue(output);

      const controller = new CreateVehiclePartController(service);

      const res = await controller.handle(
        makeReq({
          type: 'ENGINE',
          name: 'Spark Plug',
          description: 'Long description',
          quantity: 2,
          price: 50
        })
      );

      expect(res.status).toBe(201);
      expect(res.body).toEqual(output);
    });

    it('falha na validação', async () => {
      const service = serviceMock();
      const controller = new CreateVehiclePartController(service);

      await expect(() =>
        controller.handle(
          makeReq({
            type: '',
            name: '',
            description: 'short',
            quantity: 2,
            price: 50
          })
        )
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('UpdateVehiclePartController', () => {
    it('atualiza peça', async () => {
      const service = serviceMock();
      const output = makePartOutput({ id: 5, name: 'Updated' });

      service.updateVehiclePart.mockResolvedValue(output);

      const controller = new UpdateVehiclePartController(service);

      const res = await controller.handle(
        makeReq(
          { name: 'Updated' },
          { id: '5' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(output);
    });

    it('falha na validação update', async () => {
      const service = serviceMock();
      const controller = new UpdateVehiclePartController(service);

      await expect(() =>
        controller.handle(
          makeReq(
            { description: 'short' },
            { id: '1' }
          )
        )
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('GetVehiclePartController', () => {
    it('retorna peça', async () => {
      const service = serviceMock();
      const output = makePartOutput({ id: 99 });

      service.findById.mockResolvedValue(output);

      const controller = new GetVehiclePartController(service);

      const res = await controller.handle(
        makeReq(
          {},
          { id: '99' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(output);
    });
  });

  describe('DeleteVehiclePartController', () => {
    it('deleta peça', async () => {
      const service = serviceMock();
      const controller = new DeleteVehiclePartController(service);

      const res = await controller.handle(
        makeReq(
          {},
          { id: '7' }
        )
      );

      expect(res.status).toBe(204);
      expect(res.body).toBeUndefined();
    });
  });

  describe('ListVehiclePartsController', () => {
    it('lista peças paginadas', async () => {
      const service = serviceMock();
      const items = [
        makePartOutput({ id: 1 }),
        makePartOutput({ id: 2 })
      ];

      service.list.mockResolvedValue(items);
      service.countAll.mockResolvedValue(2);

      const controller = new ListVehiclePartsController(service);

      const res = await controller.handle(
        makeReq(
          {},
          {},
          { page: '1', limit: '10' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });
  });
});
