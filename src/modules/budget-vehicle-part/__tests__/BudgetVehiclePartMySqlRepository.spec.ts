import { BudgetVehiclePartMySqlRepository } from '../infra/BudgetVehiclePartMySqlRepository'
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart'

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn(),
  update: jest.fn()
}))

import * as mysql from '../../../infra/db/mysql'

describe('BudgetVehiclePartMySqlRepository', () => {
  let repo: BudgetVehiclePartMySqlRepository

  beforeEach(() => {
    repo = new BudgetVehiclePartMySqlRepository()
    jest.clearAllMocks()
  })

  it('create should insert and return restored entity', async () => {
    (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 42 })

    const e = BudgetVehiclePartEntity.create({
      budgetId: 1,
      vehiclePartId: 10,
      quantity: 3
    })

    const res = await repo.create(e)

    expect(mysql.insertOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO budget_vehicle_parts'),
      [1, 10, 3]
    )

    expect(res.toJSON()).toEqual({
      id: 42,
      budgetId: 1,
      vehiclePartId: 10,
      quantity: 3
    })
  })

  it('bulkCreate should call create for each entity', async () => {
    (mysql.insertOne as jest.Mock)
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValueOnce({ insertId: 2 })

    const e1 = BudgetVehiclePartEntity.create({
      budgetId: 1,
      vehiclePartId: 10,
      quantity: 2
    })

    const e2 = BudgetVehiclePartEntity.create({
      budgetId: 1,
      vehiclePartId: 11,
      quantity: 4
    })

    const res = await repo.bulkCreate([e1, e2])

    expect(res.map(r => r.toJSON().id)).toEqual([1, 2])
    expect(mysql.insertOne).toHaveBeenCalledTimes(2)
  })

  it('listByBudget should query and map rows', async () => {
    (mysql.query as jest.Mock).mockResolvedValue([
      {
        id: 5,
        budgetId: 2,
        vehiclePartId: 20,
        quantity: 7
      }
    ])

    const res = await repo.listByBudget(2)

    expect(mysql.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM budget_vehicle_parts'),
      [2]
    )

    expect(res[0].toJSON()).toEqual({
      id: 5,
      budgetId: 2,
      vehiclePartId: 20,
      quantity: 7
    })
  })

  it('updateQuantity should run update statement', async () => {
    (mysql.update as jest.Mock).mockResolvedValue({ affectedRows: 1 })

    await repo.updateQuantity(9, 33)

    expect(mysql.update).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE budget_vehicle_parts SET quantity = ? WHERE id = ?'),
      [33, 9]
    )
  })

  it('deleteByIds should early return when ids empty', async () => {
    await repo.deleteByIds([])

    expect(mysql.update).not.toHaveBeenCalled()
  })

  it('deleteByIds should build placeholders and call update', async () => {
    (mysql.update as jest.Mock).mockResolvedValue({ affectedRows: 3 })

    await repo.deleteByIds([1, 2, 3])

    expect(mysql.update).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM budget_vehicle_parts WHERE id IN (?,?,?)'),
      [1, 2, 3]
    )
  })

  it('create should propagate insertOne error', async () => {
    (mysql.insertOne as jest.Mock).mockRejectedValue(new Error('db fail'))

    const e = BudgetVehiclePartEntity.create({
      budgetId: 1,
      vehiclePartId: 10,
      quantity: 3
    })

    await expect(repo.create(e)).rejects.toThrow('db fail')
  })

  it('listByBudget should return empty array when no rows', async () => {
    (mysql.query as jest.Mock).mockResolvedValue([])

    const res = await repo.listByBudget(999)

    expect(res).toEqual([])
  })
})
