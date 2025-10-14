import { IVehicleRepository } from '../domain/IVehicleRepository';
import { VehicleEntity } from '../domain/Vehicle';
import { IUserService, UserOutput } from '../../user/application/UserService';
import { NotFoundServerException } from '../../../shared/application/ServerException';

export const makeVehicle = (
  overrides: Partial<ReturnType<VehicleEntity['toJSON']>> = {}
) => {
  const base = {
    id: overrides.id ?? 1,
    idPlate: 'ABC1234',
    type: 'CAR',
    model: 'Model S',
    brand: 'Tesla',
    manufactureYear: 2022,
    modelYear: 2023,
    color: 'Black',
    ownerId: 10,
    deletedAt: null as Date | null
  };

  return VehicleEntity.restore({
    ...base,
    ...overrides
  });
};

export const vehicleRepoMock = (): jest.Mocked<IVehicleRepository> => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdPlate: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn()
  };
};

export const userServiceMock = (): jest.Mocked<IUserService> => {
  return {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    findById: jest.fn(async (id: number) => {
      return {
        id,
        name: 'Owner',
        email: 'owner@mail.com',
        type: 'CLIENT',
        cpf: '000',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      } as unknown as UserOutput;
    }),
    findByEmail: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn()
  };
};

export const userServiceNotFoundMock = (): jest.Mocked<IUserService> => {
  return {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    findById: jest.fn(async (_id: number) => {
      throw new NotFoundServerException('User not found');
    }),
    findByEmail: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn()
  };
};
