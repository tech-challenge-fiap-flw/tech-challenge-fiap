import { IUserRepository } from '../domain/IUserRepository';
import { IPasswordHasher } from '../application/IPasswordHasher';
import { UserEntity } from '../domain/User';

export const makeUser = (overrides: Partial<ReturnType<UserEntity['toJSON']>> = {}) => {
  const base = {
    id: overrides.id ?? 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed:123',
    type: 'CLIENT',
    active: true,
    creationDate: overrides.creationDate ?? new Date('2024-01-01T00:00:00Z'),
    cpf: '12345678900',
    cnpj: null,
    phone: '5511999999999',
    address: 'Street 1',
    city: 'City',
    state: 'ST',
    zipCode: '00000-000',
  };
  return UserEntity.restore({ ...base, ...overrides });
};

export const repoMock = (): jest.Mocked<IUserRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});

export const hasherMock = (): jest.Mocked<IPasswordHasher> => ({
  hash: jest.fn(async (p: string) => `hashed:${p}`),
  compare: jest.fn(async (_plain: string, _hashed: string) => true),
});
