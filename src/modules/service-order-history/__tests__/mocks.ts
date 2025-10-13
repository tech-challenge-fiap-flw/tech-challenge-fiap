import { ServiceOrderHistoryEntity } from '../domain/ServiceOrderHistory';

export function makeHistory(overrides: Partial<ReturnType<ServiceOrderHistoryEntity['toJSON']>> = {}) {
  const base = ServiceOrderHistoryEntity.restore({
    id: overrides.id ?? 'hist1',
    idServiceOrder: overrides.idServiceOrder ?? 100,
    userId: overrides.userId ?? 50,
    oldStatus: overrides.oldStatus ?? 'pending',
    newStatus: overrides.newStatus ?? 'in_progress',
    changedAt: overrides.changedAt ?? new Date('2024-01-01T00:00:00Z'),
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z'),
  }).toJSON();
  return { ...base, ...overrides };
}

export function makeHistoryEntity(overrides: Partial<ReturnType<ServiceOrderHistoryEntity['toJSON']>> = {}) {
  return ServiceOrderHistoryEntity.restore(makeHistory(overrides));
}
