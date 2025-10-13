import { CreateBudgetVehicleServiceController } from '../http/controllers/CreateBudgetVehicleServiceController';
import { UpdateBudgetVehicleServiceController } from '../http/controllers/UpdateBudgetVehicleServiceController';
import { GetBudgetVehicleServiceController } from '../http/controllers/GetBudgetVehicleServiceController';
import { DeleteBudgetVehicleServiceController } from '../http/controllers/DeleteCurrentUserController';
import { NotFoundServerException } from '../../../shared/application/ServerException';

function makeHttp(body: any = {}, params: any = {}) {
  return {
    body,
    params
  } as any;
}

describe('BudgetVehicleService Controllers', () => {
  const service = {
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateBudgetVehicleServiceController', () => {
    it('should return 201 on success', async () => {
      service.create.mockResolvedValue({
        id: 1,
        budgetId: 2,
        vehicleServiceId: 3,
        price: 0
      });

      const controller = new CreateBudgetVehicleServiceController(service as any);

      const res = await controller.handle(
        makeHttp({ budgetId: 2, vehicleServiceId: 3 })
      );

      expect(res.status).toBe(201);

      expect(res.body).toEqual({
        id: 1,
        budgetId: 2,
        vehicleServiceId: 3,
        price: 0
      });
    });

    it('should throw 400 on validation error', async () => {
      const controller = new CreateBudgetVehicleServiceController(service as any);

      await expect(
        controller.handle(makeHttp({ vehicleServiceId: 3 }))
      ).rejects.toHaveProperty('message', 'Validation failed');
    });
  });

  describe('UpdateBudgetVehicleServiceController', () => {
    it('should return 200 on success', async () => {
      service.update.mockResolvedValue({
        id: 10,
        budgetId: 2,
        vehicleServiceId: 3,
        price: 50
      });

      const controller = new UpdateBudgetVehicleServiceController(service as any);

      const res = await controller.handle(
        makeHttp(
          { price: 50, budgetId: 2, vehicleServiceId: 3 },
          { id: '10' }
        )
      );

      expect(res.status).toBe(200);

      expect(res.body.price).toBe(50);
    });

    it('should throw 400 on validation error', async () => {
      const controller = new UpdateBudgetVehicleServiceController(service as any);

      await expect(
        controller.handle(makeHttp({ price: -1 }, { id: '1' }))
      ).rejects.toHaveProperty('message', 'Validation failed');
    });

    it('should propagate NotFound error', async () => {
      service.update.mockRejectedValue(
        new NotFoundServerException('Budget Vehicle Service not found')
      );

      const controller = new UpdateBudgetVehicleServiceController(service as any);

      await expect(
        controller.handle(makeHttp({ budgetId: 1, vehicleServiceId: 2 }, { id: '99' }))
      ).rejects.toBeInstanceOf(NotFoundServerException);
    });
  });

  describe('GetBudgetVehicleServiceController', () => {
    it('should return 200 on success', async () => {
      service.findById.mockResolvedValue({
        id: 5,
        budgetId: 1,
        vehicleServiceId: 2,
        price: 10
      });

      const controller = new GetBudgetVehicleServiceController(service as any);

      const res = await controller.handle(
        makeHttp({}, { id: '5' })
      );

      expect(res.status).toBe(200);

      expect(res.body.id).toBe(5);
    });

    it('should propagate not found', async () => {
      service.findById.mockRejectedValue(
        new NotFoundServerException('Budget Vehicle Service not found')
      );

      const controller = new GetBudgetVehicleServiceController(service as any);

      await expect(
        controller.handle(makeHttp({}, { id: '404' }))
      ).rejects.toBeInstanceOf(NotFoundServerException);
    });
  });

  describe('DeleteBudgetVehicleServiceController', () => {
    it('should return 204 on success', async () => {
      service.delete.mockResolvedValue(undefined);

      const controller = new DeleteBudgetVehicleServiceController(service as any);

      const res = await controller.handle(
        makeHttp({}, { id: '7' })
      );

      expect(res.status).toBe(204);
    });

    it('should propagate not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundServerException('Budget Vehicle Service not found')
      );

      const controller = new DeleteBudgetVehicleServiceController(service as any);

      await expect(
        controller.handle(makeHttp({}, { id: '7' }))
      ).rejects.toBeInstanceOf(NotFoundServerException);
    });
  });
});
