import request from 'supertest';
import express from 'express';
import { vehiclePartRouter } from '../http/vehicle-part.routes';
import * as mysql from '../../../infra/db/mysql';

jest.mock(
  '../../auth/AuthMiddleware',
  () => ({
    authMiddleware: (_req: any, _res: any, next: any) => next()
  })
);

jest.mock('../../../infra/db/mysql');

const castMysql = mysql as jest.Mocked<typeof mysql>;

describe('vehicle-part routes', () => {
  const app = express();

  app.use(express.json());
  app.use('/vehicle-parts', vehiclePartRouter);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('POST /vehicle-parts cria peça', async () => {
    castMysql.insertOne.mockResolvedValue({
      insertId: 42
    } as any);

    const res = await request(app)
      .post('/vehicle-parts')
      .send({
        type: 'ENGINE',
        name: 'Filtro',
        description: 'Descricao longa ok',
        quantity: 1,
        price: 10
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(42);
  });

  it('POST /vehicle-parts retorna 400 em validação', async () => {
    const res = await request(app)
      .post('/vehicle-parts')
      .send({
        type: '',
        name: '',
        description: 'curta',
        quantity: 1,
        price: 10
      });

    expect(res.status).toBe(400);
  });

  it('GET /vehicle-parts/:id retorna peça', async () => {
    castMysql.query.mockResolvedValueOnce([
      {
        id: 1,
        type: 'ENGINE',
        name: 'Filtro',
        description: 'Descricao longa ok',
        quantity: 1,
        price: 10,
        deletedAt: null,
        creationDate: new Date()
      }
    ] as any);

    const res = await request(app).get('/vehicle-parts/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('GET /vehicle-parts/:id not found', async () => {
    castMysql.query.mockResolvedValueOnce([] as any);

    const res = await request(app).get('/vehicle-parts/999');

    expect([404, 500]).toContain(res.status);
  });

  it('PUT /vehicle-parts/:id atualiza peça', async () => {
    castMysql.query
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce([
        {
          id: 1,
          type: 'ENGINE',
          name: 'Atualizada',
          description: 'Descricao longa ok',
          quantity: 2,
          price: 20,
          deletedAt: null,
          creationDate: new Date()
        }
      ] as any);

    const res = await request(app)
      .put('/vehicle-parts/1')
      .send({
        name: 'Atualizada'
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Atualizada');
  });

  it('PUT /vehicle-parts/:id validação inválida', async () => {
    const res = await request(app)
      .put('/vehicle-parts/1')
      .send({
        description: 'curta'
      });

    expect(res.status).toBe(400);
  });

  it('DELETE /vehicle-parts/:id realiza soft delete', async () => {
    castMysql.query
      .mockResolvedValueOnce([
        {
          id: 1,
          type: 'ENGINE',
          name: 'X',
          description: 'Descricao longa ok',
          quantity: 1,
          price: 10,
          deletedAt: null,
          creationDate: new Date()
        }
      ] as any)
      .mockResolvedValueOnce(undefined as any);

    const res = await request(app).delete('/vehicle-parts/1');

    expect(res.status).toBe(204);
  });

  it('GET /vehicle-parts lista paginada', async () => {
    castMysql.query
      .mockResolvedValueOnce([
        {
          id: 1,
          type: 'ENGINE',
          name: 'A',
          description: 'Descricao longa ok',
          quantity: 1,
          price: 10,
          deletedAt: null,
          creationDate: new Date()
        }
      ] as any)
      .mockResolvedValueOnce([
        {
          count: 1
        }
      ] as any);

    const res = await request(app).get('/vehicle-parts?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(1);
  });
});
