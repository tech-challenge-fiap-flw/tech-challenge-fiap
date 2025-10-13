import request from 'supertest';
import express from 'express';
import { userRouter } from '../http/user.routes';
import * as mysql from '../../../infra/db/mysql';
import bcrypt from 'bcrypt';

jest.mock('../../../infra/db/mysql');
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true)
}));
jest.mock('../../auth/AuthMiddleware', () => ({
  authMiddleware: (_req: any, _res: any, next: any) => {
    (_req as any).user = { sub: 1, type: 'admin' };
    return next();
  }
}));
jest.mock('../../auth/RoleMiddleware', () => ({
  requireRole: () => (_req: any, _res: any, next: any) => {
    next();
  }
}));

const castMysql = mysql as jest.Mocked<typeof mysql>;

const app = express();
app.use(express.json());
app.use('/users', userRouter);

describe('user.routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('POST /users cria usuário', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);
    castMysql.insertOne.mockResolvedValue({ insertId: 11 } as any);

    const res = await request(app)
      .post('/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: '123456',
        type: 'admin',
        cpf: '12345678900',
        phone: '5511999999999'
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(11);
  });

  it('POST /users validação falha', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'J',
        email: 'bad',
        password: '123',
        type: 'admin',
        cpf: '1',
        phone: '0'
      });

    expect(res.status).toBe(400);
  });

  it('PUT /users atualiza usuário logado', async () => {
    castMysql.update.mockResolvedValue({} as any);
    castMysql.query.mockResolvedValue([
      {
        id: 1,
        name: 'After',
        email: 'john@example.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '12345678900',
        cnpj: null,
        phone: '5511',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const res = await request(app)
      .put('/users')
      .send({ name: 'After' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('After');
  });

  it('DELETE /users soft delete', async () => {
    castMysql.query
      .mockResolvedValueOnce([
        {
          id: 1,
          name: 'X',
          email: 'john@example.com',
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
      ] as any)
      .mockResolvedValueOnce({} as any);

    const res = await request(app)
      .delete('/users');

    expect(res.status).toBe(204);
  });

  it('GET /users/me retorna perfil', async () => {
    castMysql.query.mockResolvedValueOnce([
      {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '12345678900',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const res = await request(app)
      .get('/users/me');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('GET /users/:id retorna usuário', async () => {
    castMysql.query.mockResolvedValueOnce([
      {
        id: 2,
        name: 'Jane',
        email: 'jane@example.com',
        password: 'p',
        type: 'admin',
        active: 1,
        creationDate: new Date(),
        cpf: '12345678911',
        cnpj: null,
        phone: '0',
        address: null,
        city: null,
        state: null,
        zipCode: null
      }
    ] as any);

    const res = await request(app)
      .get('/users/2');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(2);
  });

  it('GET /users lista paginada', async () => {
    castMysql.query
      .mockResolvedValueOnce([
        {
          id: 1,
          name: 'John',
          email: 'john@example.com',
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
      ] as any)
      .mockResolvedValueOnce([{ count: 1 }] as any);

    const res = await request(app)
      .get('/users?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(1);
  });
});
