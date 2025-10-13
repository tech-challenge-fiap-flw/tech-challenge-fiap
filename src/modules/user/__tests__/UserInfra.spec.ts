import * as mysql from '../../../infra/db/mysql';
import bcrypt from 'bcrypt';
import { UserMySqlRepository } from '../infra/UserMySqlRepository';
import { UserEntity } from '../domain/User';
import { BcryptPasswordHasher } from '../infra/BcryptPasswordHasher';

jest.mock('../../../infra/db/mysql');
jest.mock('bcrypt');

const castMysql = mysql as jest.Mocked<typeof mysql>;

describe('UserMySqlRepository', () => {
  beforeEach(() => jest.resetAllMocks());

  it('create insere e retorna entidade', async () => {
    castMysql.insertOne.mockResolvedValue({ insertId: 50 } as any);

    const repo = new UserMySqlRepository();

    const entity = UserEntity.create({
      name: 'John',
      email: 'john@example.com',
      password: 'hashed',
      type: 'admin',
      cpf: '12345678900',
      phone: '5511999999999'
    });

    const created = await repo.create(entity);

    expect(created.toJSON().id).toBe(50);
    expect(castMysql.insertOne).toHaveBeenCalled();
  });

  it('findById null se não encontra', async () => {
    castMysql.query.mockResolvedValue([] as any);

    const repo = new UserMySqlRepository();

    const result = await repo.findById(1);

    expect(result).toBeNull();
  });

  it('findByEmail retorna entidade', async () => {
    castMysql.query.mockResolvedValue([
      {
        id: 1,
        name: 'A',
        email: 'a@a.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '123',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const repo = new UserMySqlRepository();

    const result = await repo.findByEmail('a@a.com');

    expect(result?.toJSON().email).toBe('a@a.com');
  });

  it('update retorna entidade atualizada', async () => {
    castMysql.update.mockResolvedValue({} as any);

    castMysql.query.mockResolvedValue([
      {
        id: 1,
        name: 'After',
        email: 'a@a.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '123',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const repo = new UserMySqlRepository();

    const updated = await repo.update(1, { name: 'After' } as any);

    expect(updated?.toJSON().name).toBe('After');
  });

  it('softDelete desativa usuário', async () => {
    castMysql.update.mockResolvedValue({} as any);

    const repo = new UserMySqlRepository();

    await repo.softDelete(1);

    expect(castMysql.update).toHaveBeenCalled();
  });

  it('list retorna ativos', async () => {
    castMysql.query.mockResolvedValue([
      {
        id: 1,
        name: 'A',
        email: 'a@a.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '123',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      },
      {
        id: 2,
        name: 'B',
        email: 'b@b.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '456',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const repo = new UserMySqlRepository();

    const items = await repo.list(0, 10);

    expect(items).toHaveLength(2);
  });

  it('countAll retorna número', async () => {
    castMysql.query.mockResolvedValue([{ count: 3 }] as any);

    const repo = new UserMySqlRepository();

    const total = await repo.countAll();

    expect(total).toBe(3);
  });
});

describe('BcryptPasswordHasher', () => {
  beforeEach(() => jest.resetAllMocks());

  it('hash usa genSalt e hash', async () => {
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const hasher = new BcryptPasswordHasher(8);

    const result = await hasher.hash('plain');

    expect(result).toBe('hashed');
    expect(bcrypt.genSalt).toHaveBeenCalledWith(8);
    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 'salt');
  });

  it('compare delega ao bcrypt.compare', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const hasher = new BcryptPasswordHasher();

    const ok = await hasher.compare('plain', 'hashed');

    expect(ok).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
  });
});
