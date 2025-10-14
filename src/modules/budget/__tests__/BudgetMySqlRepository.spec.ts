import { BudgetMySqlRepository } from '../infra/BudgetMySqlRepository'
import { BudgetEntity } from '../domain/Budget'

jest.mock('../../../infra/db/mysql', () => ({
  insertOne: jest.fn(),
  query: jest.fn(),
}))

import * as mysql from '../../../infra/db/mysql'

const casted = mysql as jest.Mocked<typeof mysql>

describe('BudgetMySqlRepository', () => {
  let repo: BudgetMySqlRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repo = new BudgetMySqlRepository()
  })

  it('create deve inserir e retornar entidade com id', async () => {
    casted.insertOne.mockResolvedValueOnce({
      insertId: 55
    } as any)

    const entity = BudgetEntity.create({
      description: 'desc',
      ownerId: 1,
      diagnosisId: 2
    })

    const created = await repo.create(entity)

    expect(casted.insertOne).toHaveBeenCalled()
    expect(created.toJSON().id).toBe(55)
  })

  it('findById deve retornar entidade quando existir', async () => {
    const now = new Date()

    casted.query.mockResolvedValueOnce([
      {
        id: 10,
        description: 'd',
        ownerId: 1,
        diagnosisId: 2,
        total: 0,
        creationDate: now,
        deletedAt: null
      }
    ])

    const res = await repo.findById(10)

    expect(casted.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM budgets WHERE id = ?'),
      [10]
    )

    expect(res?.toJSON()).toMatchObject({
      id: 10
    })
  })

  it('findById deve retornar null quando não existir', async () => {
    casted.query.mockResolvedValueOnce([])

    const res = await repo.findById(999)

    expect(res).toBeNull()
  })
})
