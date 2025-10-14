import request from 'supertest';
import express from 'express';

let bcryptCompareMock: jest.Mock;
let jwtSignMock: jest.Mock;

describe('auth.routes /login', () => {
  let app: express.Express;
  let findByEmailMock: jest.Mock;
  let bcrypt: any;
  let jwt: any;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    findByEmailMock = jest.fn();
    bcryptCompareMock = jest.fn();
    jwtSignMock = jest.fn(() => 'signed.token');

    jest.doMock('bcrypt', () => ({
      compare: bcryptCompareMock
    }));

    jest.doMock('jsonwebtoken', () => ({
      sign: jwtSignMock
    }));

    jest.doMock('../../user/application/UserService', () => ({
      UserService: class {
        findByEmail = (...args: any[]) => findByEmailMock(...args);
      }
    }));

    const { authRouter } = await import('../auth.routes');
    bcrypt = await import('bcrypt');
    jwt = await import('jsonwebtoken');

    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  function buildUserEntity({
    id = 1,
    email = 'user@test.com',
    password = 'hashed',
    type = 'admin'
  } = {}) {
    const { UserEntity } = require('../../user/domain/User');

    return UserEntity.restore({
      id,
      name: 'User',
      email,
      password,
      type,
      cpf: '123',
      cnpj: null,
      phone: '999',
      address: null,
      city: null,
      state: null,
      zipCode: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  it('deve realizar login com sucesso e retornar token', async () => {
    findByEmailMock.mockResolvedValue(
      buildUserEntity()
    );

    bcryptCompareMock.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'plain'
      });

    expect(res.status).toBe(200);

    expect(jwtSignMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        sub: 1
      }),
      expect.any(String),
      {
        expiresIn: '1h'
      }
    );

    expect(res.body).toEqual({
      token: 'signed.token'
    });
  });

  it('deve retornar 400 se validação falhar (faltando campos)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@test.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(findByEmailMock).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se usuário não encontrado', async () => {
    findByEmailMock.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'no@test.com',
        password: 'x'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('deve retornar 401 se senha inválida', async () => {
    findByEmailMock.mockResolvedValue(
      buildUserEntity()
    );

    bcryptCompareMock.mockResolvedValue(false);

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'wrong'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('deve retornar 500 em erro inesperado', async () => {
    findByEmailMock.mockRejectedValue(
      new Error('boom')
    );

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'plain'
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
