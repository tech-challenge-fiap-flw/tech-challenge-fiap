import { IVehiclePartService, VehiclePartOutput } from '../application/VehiclePartService';
import { VehiclePartEntity } from '../domain/VehiclePart';

export const makePartOutput = (overrides: Partial<VehiclePartOutput> = {}): VehiclePartOutput => ({
  id: overrides.id ?? 1,
  type: overrides.type ?? 'ENGINE',
  name: overrides.name ?? 'Oil Filter',
  description: overrides.description ?? 'Filter description here',
  quantity: overrides.quantity ?? 5,
  price: overrides.price ?? 100,
  deletedAt: null,
  creationDate: overrides.creationDate ?? new Date('2024-01-01T00:00:00Z')
});

export const serviceMock = (): jest.Mocked<IVehiclePartService> => ({
  createVehiclePart: jest.fn(),
  updateVehiclePart: jest.fn(),
  deleteVehiclePart: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});

export const entityFromOutput = (o: VehiclePartOutput) => VehiclePartEntity.restore(o);
