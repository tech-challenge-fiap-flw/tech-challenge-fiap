import { Model } from 'mongoose';
import { ServiceOrderHistoryService } from './service-order-history.service';
import { ServiceOrderHistory } from '../schema/service-order-history.schema';

describe('ServiceOrderHistoryService', () => {
  let service: ServiceOrderHistoryService;
  let mockOrderHistoryModel: jest.Mocked<Model<ServiceOrderHistory>>;

  beforeEach(() => {
    // Criando mock do Model
    mockOrderHistoryModel = {
      find: jest.fn(),
      sort: jest.fn(),
      exec: jest.fn(),
    } as any;

    service = new ServiceOrderHistoryService(mockOrderHistoryModel);
  });

  describe('logStatusChange', () => {
    it('deve criar e salvar um histórico', async () => {
      const mockSave = jest.fn().mockResolvedValue({ id: 'abc123' });
      const mockConstructor = jest.fn().mockReturnValue({ save: mockSave });

      // Substitui o construtor do Model (new this.orderHistoryModel())
      (service as any).orderHistoryModel = mockConstructor;

      const result = await service.logStatusChange(
        1,        // idServiceOrder
        2,        // userId
        'PENDING',// oldStatus
        'DONE',   // newStatus
      );

      expect(mockConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          idServiceOrder: 1,
          userId: 2,
          oldStatus: 'PENDING',
          newStatus: 'DONE',
          changedAt: expect.any(Date),
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ id: 'abc123' });
    });
  });

  describe('getHistoryByServiceOrderId', () => {
    it('deve buscar histórico ordenado por changedAt', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ id: 'hist1' }]);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

      (service as any).orderHistoryModel = {
        find: mockFind,
      };

      const result = await service.getHistoryByServiceOrderId(1);

      expect(mockFind).toHaveBeenCalledWith({ idServiceOrder: 1 });
      expect(mockSort).toHaveBeenCalledWith({ changedAt: 1 });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'hist1' }]);
    });
  });
});
