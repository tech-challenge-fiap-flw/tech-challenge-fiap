import request from 'supertest';
import express from 'express';
import { diagnosisRouter } from '../http/diagnosis.routes';
import * as mysql from '../../../infra/db/mysql';
import bcrypt from 'bcrypt';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  transaction: (fn: any) => {
    return fn();
  }
}));

jest.mock('../../auth/AuthMiddleware', () => ({
  authMiddleware: (_req: any, _res: any, next: any) => {
    (_req as any).user = { sub: 1, type: 'admin' };
    return next();
  }
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true)
}));

const castMysql = mysql as jest.Mocked<typeof mysql>;

const app = express();

app.use(express.json());
app.use('/diagnosis', diagnosisRouter);

const makeDiagnosisRow = (over: any = {}) => {
  return {
    id: 1,
    description: 'Noise',
    creationDate: new Date(),
    vehicleId: 10,
    responsibleMechanicId: null,
    deletedAt: null,
    ...over
  };
};

const makeVehicleRow = (over: any = {}) => {
  return {
    id: 10,
    idPlate: 'AAA1234',
    type: 'CAR',
    model: 'X',
    brand: 'B',
    manufactureYear: 2020,
    modelYear: 2021,
    color: 'red',
    ownerId: 1,
    deletedAt: null,
    ...over
  };
};

const makeUserRow = (over: any = {}) => {
  return {
    id: 1,
    name: 'User',
    email: 'u@e.com',
    password: 'hashed',
    type: 'admin',
    active: 1,
    creationDate: new Date(),
    cpf: '12345678900',
    cnpj: null,
    phone: '0',
    address: null,
    city: null,
    state: null,
    zipCode: null,
    ...over
  };
};

describe('diagnosis.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /diagnosis cria sem mechanicId', async () => {
    castMysql.query.mockResolvedValueOnce([makeVehicleRow()] as any);
    castMysql.insertOne.mockResolvedValue({ insertId: 55 } as any);

    const res = await request(app)
      .post('/diagnosis')
      .send({ description: 'Noise', vehicleId: 10 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(55);
  });

  it('POST /diagnosis cria com mechanicId', async () => {
    castMysql.query
      .mockResolvedValueOnce([makeVehicleRow()] as any)
      .mockResolvedValueOnce([makeUserRow({ id: 5 })] as any);

    castMysql.insertOne.mockResolvedValue({ insertId: 56 } as any);

    const res = await request(app)
      .post('/diagnosis')
      .send({ description: 'Vibration', vehicleId: 10, mechanicId: 5 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(56);
  });

  it('POST /diagnosis validação falha', async () => {
    const res = await request(app)
      .post('/diagnosis')
      .send({ description: 'No', vehicleId: -1 });

    expect(res.status).toBe(400);
  });

  it('POST /diagnosis vehicle não encontrado', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);

    const res = await request(app)
      .post('/diagnosis')
      .send({ description: 'Noise', vehicleId: 999 });

    expect(res.status).toBe(404);
  });

  it('POST /diagnosis mechanic não encontrado', async () => {
    castMysql.query
      .mockResolvedValueOnce([makeVehicleRow()] as any)
      .mockResolvedValueOnce([] as any);

    const res = await request(app)
      .post('/diagnosis')
      .send({ description: 'Noise', vehicleId: 10, mechanicId: 777 });

    expect(res.status).toBe(404);
  });

  it('GET /diagnosis/:id retorna', async () => {
    castMysql.query.mockResolvedValueOnce([makeDiagnosisRow({ id: 70 })] as any);

    const res = await request(app)
      .get('/diagnosis/70');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(70);
  });

  it('GET /diagnosis/:id not found', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);

    const res = await request(app)
      .get('/diagnosis/999');

    expect(res.status).toBe(404);
  });

  it('PUT /diagnosis/:id atualiza', async () => {
    castMysql.query
      .mockResolvedValueOnce([makeDiagnosisRow({ id: 80 })] as any)
      .mockResolvedValueOnce([{}] as any)
      .mockResolvedValueOnce([makeDiagnosisRow({ id: 80, description: 'Updated' })] as any);

    const res = await request(app)
      .put('/diagnosis/80')
      .send({ description: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated');
  });

  it('PUT /diagnosis/:id not found', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);

    const res = await request(app)
      .put('/diagnosis/81')
      .send({ description: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('DELETE /diagnosis/:id deleta', async () => {
    castMysql.query
      .mockResolvedValueOnce([makeDiagnosisRow({ id: 90 })] as any)
      .mockResolvedValueOnce([] as any);

    const res = await request(app)
      .delete('/diagnosis/90');

    expect(res.status).toBe(204);
  });

  it('DELETE /diagnosis/:id not found', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);

    const res = await request(app)
      .delete('/diagnosis/91');

    expect(res.status).toBe(404);
  });

  it('GET /diagnosis lista', async () => {
    castMysql.query
      .mockResolvedValueOnce([makeDiagnosisRow({ id: 1 }), makeDiagnosisRow({ id: 2 })] as any)
      .mockResolvedValueOnce([{ count: 2 }] as any);

    const res = await request(app)
      .get('/diagnosis?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(2);
    expect(res.body.total).toBe(2);
  });

  it('GET /diagnosis lista vazia', async () => {
    castMysql.query
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([{ count: 0 }] as any);

    const res = await request(app)
      .get('/diagnosis?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
    expect(res.body.total).toBe(0);
  });
});
