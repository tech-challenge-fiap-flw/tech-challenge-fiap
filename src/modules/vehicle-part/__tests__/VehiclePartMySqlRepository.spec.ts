import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import * as mysql from '../../../infra/db/mysql';
import { VehiclePartEntity } from '../domain/VehiclePart';

jest.mock('../../../infra/db/mysql');

const castMysql = mysql as jest.Mocked<typeof mysql>;

describe('VehiclePartMySqlRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('create insere e retorna entidade restaurada', async () => {
    castMysql.insertOne.mockResolvedValue({ insertId: 123 } as any);

    const repo = new VehiclePartMySqlRepository();

    const entity = VehiclePartEntity.create({
      type: 'ENGINE',
      name: 'Filter',
      description: 'Long description',
      quantity: 1,
      price: 10
    });

    const created = await repo.create(entity);

    expect(castMysql.insertOne).toHaveBeenCalled();

    expect(
      created.toJSON().id
    ).toBe(123);
  });

  it('findById retorna null se vazio', async () => {
    castMysql.query.mockResolvedValue([] as any);

    const repo = new VehiclePartMySqlRepository();

    const found = await repo.findById(1);

    expect(found).toBeNull();
  });

  it('findById retorna entidade', async () => {
    castMysql.query.mockResolvedValue([
      {
        id: 1,
        type: 'ENGINE',
        name: 'X',
        description: 'Long description',
        quantity: 2,
        price: 10,
        deletedAt: null,
        creationDate: new Date()
      }
    ] as any);

    const repo = new VehiclePartMySqlRepository();

    const found = await repo.findById(1);

    expect(
      found?.toJSON().id
    ).toBe(1);
  });

  it('update altera registros e retorna entidade', async () => {
    castMysql.query.mockResolvedValueOnce(undefined as any);

    castMysql.query.mockResolvedValueOnce([
      {
        id: 1,
        type: 'ENGINE',
        name: 'After',
        description: 'Long description',
        quantity: 2,
        price: 10,
        deletedAt: null,
        creationDate: new Date()
      }
    ] as any);

    const repo = new VehiclePartMySqlRepository();

    const updated = await repo.update(1, { name: 'After' });

    expect(
      updated?.toJSON().name
    ).toBe('After');
  });

  it('softDelete executa update', async () => {
    castMysql.query.mockResolvedValue(undefined as any);

    const repo = new VehiclePartMySqlRepository();

    await repo.softDelete(5);

    expect(castMysql.query).toHaveBeenCalled();
  });

  it('list retorna entidades mapeadas', async () => {
    castMysql.query.mockResolvedValue([
      {
        id: 1,
        type: 'ENGINE',
        name: 'A',
        description: 'Long description',
        quantity: 1,
        price: 10,
        deletedAt: null,
        creationDate: new Date()
      },
      {
        id: 2,
        type: 'ENGINE',
        name: 'B',
        description: 'Long description',
        quantity: 1,
        price: 20,
        deletedAt: null,
        creationDate: new Date()
      }
    ] as any);

    const repo = new VehiclePartMySqlRepository();

    const items = await repo.list(0, 10);

    expect(items).toHaveLength(2);
  });

  it('countAll retorna número', async () => {
    castMysql.query.mockResolvedValue([
      { count: 7 }
    ] as any);

    const repo = new VehiclePartMySqlRepository();

    const total = await repo.countAll();

    expect(total).toBe(7);
  });
});
