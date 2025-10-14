import { VehicleServiceEntity, VehicleServiceProps } from '../domain/VehicleService';
import { VehicleServiceRepository } from '../domain/VehicleServiceRepository';

export const makeService = (overrides: Partial<VehicleServiceProps> = {}) => {
  const base: VehicleServiceProps = {
    id: overrides.id ?? 1,
    name: 'Alignment',
    price: 150,
    description: 'Wheel alignment',
    deletedAt: null
  };
  return VehicleServiceEntity.restore({ ...base, ...overrides });
};

export const serviceRepoMock = (): jest.Mocked<VehicleServiceRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});
