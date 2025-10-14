import { LogServiceOrderHistoryController } from '../http/controllers/LogServiceOrderHistoryController';
import { ListServiceOrderHistoryController } from '../http/controllers/ListServiceOrderHistoryController';
import { HttpError } from '../../../shared/http/HttpError';

const makeReq = (body: any = {}, params: any = {}, query: any = {}) => ({ body, params, query, raw: { query } } as any);

function serviceMock() {
  return {
    logStatusChange: jest.fn(),
    listByServiceOrder: jest.fn()
  };
}

describe('ServiceOrderHistory Controllers', () => {
  describe('LogServiceOrderHistoryController', () => {
    it('cria log', async () => {
      const service = serviceMock();
      service.logStatusChange.mockResolvedValue({
        id: 'x1',
        idServiceOrder: 1,
        userId: 2,
        oldStatus: 'pending',
        newStatus: 'in_progress',
        changedAt: new Date()
      });
      const controller = new LogServiceOrderHistoryController(service as any);
      const res = await controller.handle(makeReq({ idServiceOrder: 1, userId: 2, oldStatus: 'pending', newStatus: 'in_progress' }));
      expect(res.status).toBe(201);
      expect(res.body.id).toBe('x1');
    });

    it('falha validação', async () => {
      const service = serviceMock();
      const controller = new LogServiceOrderHistoryController(service as any);
      await expect(controller.handle(makeReq({ idServiceOrder: -1, userId: 0, newStatus: '' })))
        .rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('ListServiceOrderHistoryController', () => {
    it('lista logs', async () => {
      const service = serviceMock();
      service.listByServiceOrder.mockResolvedValue([
        { id: 'h1', idServiceOrder: 5, userId: 2, oldStatus: 'pending', newStatus: 'in_progress', changedAt: new Date() }
      ]);
      const controller = new ListServiceOrderHistoryController(service as any);
      const res = await controller.handle(makeReq({}, { idServiceOrder: '5' }));
      expect(res.status).toBe(200);
      expect(res.body[0].id).toBe('h1');
    });

    it('falha validação idServiceOrder inválido', async () => {
      const service = serviceMock();
      const controller = new ListServiceOrderHistoryController(service as any);
      await expect(controller.handle(makeReq({}, { idServiceOrder: '0' })))
        .rejects.toBeInstanceOf(HttpError);
    });
  });
});
