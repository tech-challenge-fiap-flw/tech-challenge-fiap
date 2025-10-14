import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../domain/VehicleService';

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn()
}));

import * as mysql from '../../../infra/db/mysql';
const db = mysql as jest.Mocked<typeof mysql>;

describe('VehicleServiceMySqlRepository', () => {
  let repo: VehicleServiceMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VehicleServiceMySqlRepository();
  });

  function sample() {
    return VehicleServiceEntity.create({
      name: 'Alinhamento',
      price: 100,
      description: 'Desc'
    });
  }

  it('create insere e retorna entidade com id', async () => {
    db.insertOne.mockResolvedValueOnce({
      insertId: 10
    } as any);

    const created = await repo.create(sample());

    expect(db.insertOne).toHaveBeenCalled();
    expect(created.toJSON().id).toBe(10);
  });

  it('findById retorna entidade existente', async () => {
    db.query.mockResolvedValueOnce([
      {
        id: 5,
        name: 'Serv',
        price: 20,
        description: null,
        deletedAt: null
      }
    ]);

    const found = await repo.findById(5);

    expect(found?.toJSON().id).toBe(5);
  });

  it('findById retorna null quando não existe', async () => {
    db.query.mockResolvedValueOnce([]);

    const found = await repo.findById(99);

    expect(found).toBeNull();
  });

  it('update monta SET dinamicamente e retorna atualizado', async () => {
    db.query.mockResolvedValueOnce(undefined as any);

    db.query.mockResolvedValueOnce([
      {
        id: 7,
        name: 'Novo',
        price: 50,
        description: null,
        deletedAt: null
      }
    ]);

    const updated = await repo.update(7, {
      name: 'Novo'
    });

    expect(updated?.toJSON().name).toBe('Novo');
  });

  it('softDelete marca deletedAt', async () => {
    db.query.mockResolvedValueOnce(undefined as any);

    await repo.softDelete(3);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE vehicle_services SET deletedAt = NOW() WHERE id = ?'),
      [3]
    );
  });

  it('list retorna itens paginados', async () => {
    db.query.mockResolvedValueOnce([
      {
        id: 1,
        name: 'A',
        price: 10,
        description: null,
        deletedAt: null
      },
      {
        id: 2,
        name: 'B',
        price: 20,
        description: null,
        deletedAt: null
      }
    ]);

    const items = await repo.list(0, 10);

    expect(db.query.mock.calls[0][0]).toContain('LIMIT 10 OFFSET 0');
    expect(items).toHaveLength(2);
  });

  it('countAll consulta tabela correta vehicle_services e retorna count', async () => {
    db.query.mockResolvedValueOnce([
      {
        count: 42
      }
    ]);

    const count = await repo.countAll();

    expect(count).toBe(42);

    const sqlUsed = db.query.mock.calls[0][0];

    expect(sqlUsed).toContain('vehicle_services');
  });
});
