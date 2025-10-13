import request from 'supertest';
import { ObjectId } from 'mongodb';

// Helper para construir app após configurar mocks antes da criação do repository interno do router
async function buildApp(collection: any) {
  jest.resetModules();

  // Remock mongo e auth antes de importar o router (que instancia o repository)
  jest.doMock('../../../infra/mongo/mongo', () => ({
    getCollection: jest.fn().mockResolvedValue(collection)
  }));

  jest.doMock('../../auth/AuthMiddleware', () => ({
    authMiddleware: (_req: any, _res: any, next: any) => {
      (_req as any).user = { sub: 1, type: 'admin' };
      return next();
    }
  }));

  const express = (await import('express')).default;
  const { serviceOrderHistoryRouter } = await import('../http/service-order-history.routes');

  const app = express();
  app.use(express.json());
  app.use('/service-order-history', serviceOrderHistoryRouter);
  return app;
}

function makeDoc(over: any = {}) {
  const { _id: providedId, ...rest } = over;
  const idString = providedId || '6561bcf6f45e1e1e1e1e1e1a';
  const objectIdLike = { toHexString: () => idString };
  return {
    idServiceOrder: 10,
    userId: 2,
    oldStatus: 'pending',
    newStatus: 'in_progress',
    changedAt: new Date('2024-01-01T00:00:00Z'),
    createdAt: null,
    updatedAt: null,
    ...rest,
    _id: objectIdLike
  };
}

describe('service-order-history.routes', () => {
  it('POST /service-order-history cria log', async () => {
    const insertOne = jest.fn(async () => ({ insertedId: new ObjectId('6561bcf6f45e1e1e1e1e1e1d') }));
    const app = await buildApp({ insertOne });

    const res = await request(app)
      .post('/service-order-history')
      .send({ idServiceOrder: 10, userId: 2, oldStatus: 'pending', newStatus: 'in_progress' });

    expect(insertOne).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('6561bcf6f45e1e1e1e1e1e1d');
  });

  it('POST /service-order-history validação falha', async () => {
    const app = await buildApp({ insertOne: jest.fn() });

    const res = await request(app)
      .post('/service-order-history')
      .send({ idServiceOrder: 0, userId: 0, newStatus: '' });

    expect(res.status).toBe(400);
  });

  it('GET /service-order-history/:idServiceOrder lista logs', async () => {
    const docs = [
      makeDoc({ _id: '6561bcf6f45e1e1e1e1e1e10', changedAt: new Date('2024-01-01T00:00:00Z') }),
      makeDoc({ _id: '6561bcf6f45e1e1e1e1e1e11', changedAt: new Date('2024-01-02T00:00:00Z'), newStatus: 'done', oldStatus: 'in_progress' })
    ];
    const toArray = jest.fn(async () => docs);
    const sort = jest.fn(() => ({ toArray }));
    const find = jest.fn(() => ({ sort }));
    const app = await buildApp({ find });

    const res = await request(app)
      .get('/service-order-history/10');

    expect(find).toHaveBeenCalledWith({ idServiceOrder: 10 });
    expect(sort).toHaveBeenCalledWith({ changedAt: 1 });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].idServiceOrder).toBe(10);
  });

  it('GET /service-order-history/:idServiceOrder validação falha', async () => {
    const app = await buildApp({ find: jest.fn() });

    const res = await request(app)
      .get('/service-order-history/0');

    expect(res.status).toBe(400);
  });
});
