import { User } from 'src/auth-and-access/user/domain/entities/user.entity';

export function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Usuário Teste',
    email: 'user@test.com',
    password: 'hashedpassword',
    type: 'cliente',
    active: true,
    creationDate: new Date(),
    cpf: '000.000.000-00',
    cnpj: null,
    phone: '11999999999',
    address: 'Rua Teste, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '00000-000',
    ...overrides,
  };
}
