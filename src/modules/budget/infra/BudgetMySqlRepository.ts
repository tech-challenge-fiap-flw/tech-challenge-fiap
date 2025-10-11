import * as mysql from '../../../infra/db/mysql';
import { IBudgetRepository } from '../domain/IBudgetRepository';
import { BudgetEntity, BudgetId, BudgetProps } from '../domain/Budget';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { BaseRepository } from '../../../shared/domain/BaseRepository';

export class BudgetMySqlRepository extends BaseRepository implements IBudgetRepository {
  async create(entity: BudgetEntity): Promise<BudgetEntity> {
    const data = entity.toJSON();

    const sql = `
      INSERT INTO budgets 
        (description, ownerId, diagnosisId, total, creationDate, deletedAt) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.description,
      data.ownerId,
      data.diagnosisId,
      data.total,
      data.creationDate,
      data.deletedAt ?? null
    ];

    const result = await mysql.insertOne(sql, params);

    return BudgetEntity.restore({ ...data, id: result.insertId });
  }
}
