import { IUserService, UserOutput } from '../../user/application/UserService';
import { UserEntity } from '../../user/domain/User';

export const makeUserOutput = (overrides: Partial<UserOutput> = {}): UserOutput => ({
  id: overrides.id ?? 1,
  name: overrides.name ?? 'John Doe',
  email: overrides.email ?? 'john@example.com',
  type: overrides.type ?? 'admin',
  cpf: overrides.cpf ?? '12345678900',
  cnpj: overrides.cnpj ?? null,
  phone: overrides.phone ?? '5511999999999',
  address: overrides.address ?? null,
  city: overrides.city ?? null,
  state: overrides.state ?? null,
  zipCode: overrides.zipCode ?? null,
  active: true,
  creationDate: overrides.creationDate ?? new Date('2024-01-01T00:00:00Z')
});

export const userServiceMock = (): jest.Mocked<IUserService> => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});
