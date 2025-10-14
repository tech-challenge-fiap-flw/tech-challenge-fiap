import { ServiceOrderMySqlRepository } from '../infra/ServiceOrderMySqlRepository';
import { ServiceOrderEntity } from '../domain/ServiceOrder';
import { ServiceOrderStatus } from '../../../shared/ServiceOrderStatus';

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn(),
  update: jest.fn(),
}));

import * as mysql from '../../../infra/db/mysql';

const m = mysql as jest.Mocked<typeof mysql>;

describe('ServiceOrderMySqlRepository', () => {
  let repo: ServiceOrderMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ServiceOrderMySqlRepository();
  });

  function makeEntity() {
    return ServiceOrderEntity.create({
      description: 'Troca de óleo',
      budgetId: null,
      customerId: 10,
      vehicleId: 5,
      mechanicId: null
    });
  }

  it('create deve inserir e retornar entidade com id', async () => {
    m.insertOne.mockResolvedValueOnce({ insertId: 123 } as any);

    const entity = makeEntity();

    const created = await repo.create(entity);

    expect(m.insertOne).toHaveBeenCalledTimes(1);

    expect(created.toJSON().id).toBe(123);
  });

  it('findById retorna entidade quando encontrada', async () => {
    const rowDate = new Date();

    m.query.mockResolvedValueOnce([
      {
        id: 7,
        description: 'Desc',
        budgetId: null,
        customerId: 1,
        mechanicId: null,
        vehicleId: 2,
        creationDate: rowDate,
        currentStatus: ServiceOrderStatus.RECEBIDA,
        active: true
      }
    ]);

    const res = await repo.findById(7);

    expect(m.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM service_orders WHERE id = ?'),
      [7]
    );

    expect(res?.toJSON().id).toBe(7);
  });

  it('findById retorna null quando não encontrado', async () => {
    m.query.mockResolvedValueOnce([]);

    const res = await repo.findById(999);

    expect(res).toBeNull();
  });

  it('update monta SET dinamicamente e retorna entidade atualizada', async () => {
    m.update.mockResolvedValueOnce({} as any);

    m.query.mockResolvedValueOnce([
      {
        id: 50,
        description: 'Desc',
        budgetId: null,
        customerId: 1,
        mechanicId: 33,
        vehicleId: 2,
        creationDate: new Date(),
        currentStatus: ServiceOrderStatus.EM_EXECUCAO,
        active: true
      }
    ]);

    const res = await repo.update(
      50,
      {
        mechanicId: 33,
        currentStatus: ServiceOrderStatus.EM_EXECUCAO
      }
    );

    expect(m.update).toHaveBeenCalledTimes(1);

    const [sql, params] = m.update.mock.calls[0];

    expect(sql).toMatch(/UPDATE service_orders SET mechanicId = \?, currentStatus = \? WHERE id = \?/);

    expect(params).toEqual([33, ServiceOrderStatus.EM_EXECUCAO, 50]);

    expect(res?.toJSON().mechanicId).toBe(33);
  });

  it('softDelete atualiza active = 0', async () => {
    m.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await repo.softDelete(10);

    expect(m.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE service_orders SET active = 0 WHERE id = ?'),
      [10]
    );
  });

  it('findActiveByBudgetId retorna entidade ativa', async () => {
    m.query.mockResolvedValueOnce([
      {
        id: 88,
        description: 'X',
        budgetId: 5,
        customerId: 1,
        mechanicId: null,
        vehicleId: 2,
        creationDate: new Date(),
        currentStatus: ServiceOrderStatus.RECEBIDA,
        active: true
      }
    ]);

    const res = await repo.findActiveByBudgetId(5);

    expect(m.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM service_orders WHERE budgetId = ? AND active = 1'),
      [5]
    );

    expect(res?.toJSON().id).toBe(88);
  });

  it('findActiveByBudgetId retorna null quando vazio', async () => {
    m.query.mockResolvedValueOnce([]);

    const res = await repo.findActiveByBudgetId(6);

    expect(res).toBeNull();
  });
});
