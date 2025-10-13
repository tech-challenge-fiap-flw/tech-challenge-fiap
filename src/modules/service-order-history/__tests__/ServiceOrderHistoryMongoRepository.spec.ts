import { ServiceOrderHistoryMongoRepository } from '../infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderHistoryEntity } from '../domain/ServiceOrderHistory';
import { ObjectId } from 'mongodb';

jest.mock('../../../infra/mongo/mongo', () => {
  return {
    getCollection: jest.fn()
  };
});

const { getCollection } = require('../../../infra/mongo/mongo');

describe('ServiceOrderHistoryMongoRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('log insere documento e retorna entidade com id', async () => {
    const insertOne = jest.fn(async () => {
      return { insertedId: new ObjectId('6561bcf6f45e1e1e1e1e1e1e') };
    });

    getCollection.mockResolvedValue({
      insertOne
    } as any);

    const repo = new ServiceOrderHistoryMongoRepository();

    const entity = ServiceOrderHistoryEntity.create({
      idServiceOrder: 10,
      userId: 5,
      oldStatus: 'pending',
      newStatus: 'in_progress'
    });

    const saved = await repo.log(entity);

    expect(insertOne).toHaveBeenCalled();
    expect(saved.toJSON().id).toBe('6561bcf6f45e1e1e1e1e1e1e');
  });

  it('listByServiceOrder retorna ordenado por changedAt asc', async () => {
    const docs = [
      {
        _id: new ObjectId('6561bcf6f45e1e1e1e1e1e1a'),
        idServiceOrder: 5,
        userId: 1,
        oldStatus: 'pending',
        newStatus: 'in_progress',
        changedAt: new Date('2024-01-02T00:00:00Z'),
        createdAt: null,
        updatedAt: null
      },
      {
        _id: new ObjectId('6561bcf6f45e1e1e1e1e1e1b'),
        idServiceOrder: 5,
        userId: 1,
        oldStatus: 'in_progress',
        newStatus: 'done',
        changedAt: new Date('2024-01-03T00:00:00Z'),
        createdAt: null,
        updatedAt: null
      },
      {
        _id: new ObjectId('6561bcf6f45e1e1e1e1e1e1c'),
        idServiceOrder: 5,
        userId: 1,
        oldStatus: 'created',
        newStatus: 'pending',
        changedAt: new Date('2024-01-01T00:00:00Z'),
        createdAt: null,
        updatedAt: null
      }
    ];

    let docsSorted: any[] = [];

    const toArray = jest.fn(async () => {
      return docsSorted;
    });

    const sort = jest.fn(() => {
      return { toArray };
    });

    const find = jest.fn(() => {
      return { sort };
    });

    docsSorted = [...docs].sort((a, b) => {
      return a.changedAt.getTime() - b.changedAt.getTime();
    });

    getCollection.mockResolvedValue({
      find
    } as any);

    const repo = new ServiceOrderHistoryMongoRepository();

    const items = await repo.listByServiceOrder(5);

    expect(find).toHaveBeenCalledWith({ idServiceOrder: 5 });
    expect(sort).toHaveBeenCalledWith({ changedAt: 1 });
    expect(items.map(i => i.toJSON().id)).toEqual([
      '6561bcf6f45e1e1e1e1e1e1c',
      '6561bcf6f45e1e1e1e1e1e1a',
      '6561bcf6f45e1e1e1e1e1e1b'
    ]);
  });
});
