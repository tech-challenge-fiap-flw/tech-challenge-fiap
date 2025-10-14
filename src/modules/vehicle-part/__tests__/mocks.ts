import { VehiclePartEntity, VehiclePartProps } from '../domain/VehiclePart';
import { VehiclePartRepository } from '../domain/VehiclePartRepository';

export const makePart = (overrides: Partial<VehiclePartProps> = {}) => {
  const base: VehiclePartProps = {
    id: overrides.id ?? 1,
    type: 'ENGINE',
    name: 'Oil Filter',
    description: 'Filter description',
    quantity: 5,
    price: 100,
    deletedAt: null,
    creationDate: overrides.creationDate ?? new Date('2024-01-01T00:00:00Z')
  };
  return VehiclePartEntity.restore({ ...base, ...overrides });
};

export const partRepoMock = (): any => ({
  transaction: async <T>(fn: () => Promise<T>) => fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});
