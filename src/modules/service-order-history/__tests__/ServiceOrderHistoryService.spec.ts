import { ServiceOrderHistoryService } from '../application/ServiceOrderHistoryService';
import { makeHistoryEntity } from './mocks';
import 'jest';

const repo = { log: jest.fn(), listByServiceOrder: jest.fn() };
const emailService = { send: jest.fn() };
const serviceOrderRepo = { findById: jest.fn() };
const userRepo = { findById: jest.fn() };

function setup() {
  return new ServiceOrderHistoryService(
    repo as any,
    emailService as any,
    serviceOrderRepo as any,
    userRepo as any
  );
}

describe('ServiceOrderHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (serviceOrderRepo.findById as any).mockResolvedValue({
      toJSON: () => ({ id: 1, customerId: 99 })
    });
    (userRepo.findById as any).mockResolvedValue({
      toJSON: () => ({ id: 99, email: 'c@example.com', name: 'Cliente' })
    });
  });

  describe('logStatusChange', () => {
    it('cria entidade e delega repo.log', async () => {
      const service = setup();

      repo.log.mockImplementation(async (entity: any) => {
        return makeHistoryEntity({
          ...entity.toJSON(),
          id: 'newId'
        });
      });

      const out = await service.logStatusChange({
        idServiceOrder: 1,
        userId: 2,
        oldStatus: 'pending',
        newStatus: 'in_progress'
      });

      expect(repo.log).toHaveBeenCalled();
      expect(emailService.send).toHaveBeenCalledWith(expect.objectContaining({
        to: 'c@example.com',
        subject: expect.stringContaining('#1')
      }));
      expect(out.id).toBe('newId');
      expect(out.changedAt).toBeInstanceOf(Date);
    });
  });

  describe('listByServiceOrder', () => {
    it('retorna lista convertida para json', async () => {
      const service = setup();

      repo.listByServiceOrder.mockResolvedValue([
        makeHistoryEntity({
          id: 'h1',
          idServiceOrder: 5
        }),
        makeHistoryEntity({
          id: 'h2',
          idServiceOrder: 5
        })
      ]);

      const out = await service.listByServiceOrder(5);

      expect(repo.listByServiceOrder).toHaveBeenCalledWith(5);
      expect(out).toHaveLength(2);
      expect(out[0].id).toBe('h1');
    });
  });
});
