import { IUserService, UserOutput } from '../../user/application/UserService';
import { UserEntity } from '../../user/domain/User';

export const makeUser = (overrides: Partial<ReturnType<UserEntity['toJSON']>> = {}) => {
  const base = {
    id: overrides.id ?? 1,
    name: 'Auth User',
    email: 'auth@example.com',
    password: '$2b$10$hashhashhashhashhashhashhashhashhashha',
    type: 'ADMIN',
    active: true,
    creationDate: new Date('2024-01-01T00:00:00Z'),
    cpf: '12345678900',
    cnpj: null as string | null,
    phone: '5511999999999',
    address: null as string | null,
    city: null as string | null,
    state: null as string | null,
    zipCode: null as string | null,
  };
  return UserEntity.restore({ ...base, ...overrides });
};

export const userServiceMock = (): jest.Mocked<IUserService> => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
});
