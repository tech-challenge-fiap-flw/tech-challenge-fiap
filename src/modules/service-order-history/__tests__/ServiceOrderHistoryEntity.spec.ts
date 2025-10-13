import { ServiceOrderHistoryEntity } from '../domain/ServiceOrderHistory';

describe('ServiceOrderHistoryEntity', () => {
  it('create gera changedAt automaticamente', () => {
    const before = Date.now();

    const entity = ServiceOrderHistoryEntity.create({
      idServiceOrder: 1,
      userId: 2,
      oldStatus: 'pending',
      newStatus: 'in_progress'
    });

    const json = entity.toJSON();

    expect(json.changedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(json.id).toBeUndefined();
    expect(json.newStatus).toBe('in_progress');
  });

  it('restore mantém dados', () => {
    const date = new Date('2024-01-01T00:00:00Z');

    const entity = ServiceOrderHistoryEntity.restore({
      id: 'abc',
      idServiceOrder: 10,
      userId: 20,
      oldStatus: 'pending',
      newStatus: 'done',
      changedAt: date,
      createdAt: date,
      updatedAt: date
    });

    expect(entity.toJSON()).toMatchObject({
      id: 'abc',
      newStatus: 'done'
    });
  });
});
