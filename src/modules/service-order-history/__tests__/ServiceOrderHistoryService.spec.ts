import { ServiceOrderHistoryService } from '../application/ServiceOrderHistoryService';
import { makeHistoryEntity } from './mocks';

const repo = {
  log: jest.fn(),
  listByServiceOrder: jest.fn()
};

function setup() {
  return new ServiceOrderHistoryService(
    repo as any
  );
}

describe('ServiceOrderHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
