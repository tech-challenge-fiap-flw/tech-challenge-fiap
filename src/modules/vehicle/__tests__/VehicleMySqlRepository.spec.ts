import { VehicleMySqlRepository } from '../infra/VehicleMySqlRepository';
import { VehicleEntity } from '../domain/Vehicle';

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn()
}));

import * as mysql from '../../../infra/db/mysql';
const db = mysql as jest.Mocked<typeof mysql>;

function sample() {
  return VehicleEntity.create({
    idPlate: 'ABC1234',
    type: 'car',
    model: 'Model S',
    brand: 'Tesla',
    manufactureYear: 2023,
    modelYear: 2024,
    color: 'red',
    ownerId: 1
  });
}

describe('VehicleMySqlRepository', () => {
  let repo: VehicleMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VehicleMySqlRepository();
  });

  it('create insere veículo e retorna com id', async () => {
    db.insertOne.mockResolvedValueOnce({ insertId: 55 } as any);

    const created = await repo.create(sample());

    expect(db.insertOne).toHaveBeenCalled();
    expect(created.toJSON().id).toBe(55);
  });

  it('findById retorna veículo existente', async () => {
    db.query.mockResolvedValueOnce([
      {
        id: 1,
        ...sample().toJSON(),
        deletedAt: null
      }
    ]);

    const found = await repo.findById(1);

    expect(found?.toJSON().id).toBe(1);
  });

  it('findById retorna null se inexistente', async () => {
    db.query.mockResolvedValueOnce([]);

    const found = await repo.findById(999);

    expect(found).toBeNull();
  });

  it('findByIdPlate retorna veículo existente', async () => {
    db.query.mockResolvedValueOnce([
      {
        id: 2,
        ...sample().toJSON(),
        deletedAt: null
      }
    ]);

    const found = await repo.findByIdPlate('ABC1234');

    expect(found?.toJSON().idPlate).toBe('ABC1234');
  });

  it('findByIdPlate retorna null se inexistente', async () => {
    db.query.mockResolvedValueOnce([]);

    const found = await repo.findByIdPlate('ZZZ9999');

    expect(found).toBeNull();
  });

  it('update atualiza campos dinamicamente e retorna atualizado', async () => {
    db.query.mockResolvedValueOnce(undefined as any);
    db.query.mockResolvedValueOnce([
      {
        id: 3,
        ...sample().toJSON(),
        color: 'blue',
        deletedAt: null
      }
    ]);

    const updated = await repo.update(3, { color: 'blue' });

    expect(updated?.toJSON().color).toBe('blue');
    expect(db.query.mock.calls[0][0]).toContain('UPDATE vehicles SET color = ? WHERE id = ?');
  });

  it('softDelete marca deletedAt', async () => {
    db.query.mockResolvedValueOnce(undefined as any);

    await repo.softDelete(4);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE vehicles SET deletedAt = NOW() WHERE id = ?'),
      [4]
    );
  });

  it('list retorna lista paginada', async () => {
    db.query.mockResolvedValueOnce([
      {
        id: 1,
        ...sample().toJSON(),
        deletedAt: null
      },
      {
        id: 2,
        ...sample().toJSON(),
        deletedAt: null
      }
    ]);

    const items = await repo.list(0, 10);

    expect(db.query.mock.calls[0][0]).toContain('LIMIT 10 OFFSET 0');
    expect(items).toHaveLength(2);
  });

  it('countAll retorna número total', async () => {
    db.query.mockResolvedValueOnce([{ count: 7 }]);

    const total = await repo.countAll();

    expect(total).toBe(7);
  });
});
