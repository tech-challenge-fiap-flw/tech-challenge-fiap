import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { BudgetEntity, BudgetId, BudgetProps } from '../domain/Budget';
import { BudgetRepository, BudgetVehiclePartRepository, BudgetVehicleServiceRepository } from '../domain/BudgetRepositories';
import { BudgetVehiclePartEntity, BudgetVehiclePartProps } from '../domain/BudgetVehiclePart';
import { BudgetVehicleServiceEntity, BudgetVehicleServiceProps } from '../domain/BudgetVehicleService';

export class BudgetMySqlRepository implements BudgetRepository {
  async create(entity: BudgetEntity): Promise<BudgetEntity> {
    const data = entity.toJSON();
    const sql = `INSERT INTO budgets (description, ownerId, diagnosisId, total, creationDate, deletedAt)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [data.description, data.ownerId, data.diagnosisId, data.total, data.creationDate ?? new Date(), data.deletedAt ?? null];
    const result = await query<ResultSetHeader>(sql, params);
    const id = (result as any).insertId as number;
    return BudgetEntity.restore({ ...data, id });
  }
  async findById(id: BudgetId): Promise<BudgetEntity | null> {
    const rows = await query<BudgetProps & RowDataPacket>(`SELECT * FROM budgets WHERE id = ?`, [id]);
    if (!rows.length) return null;
    return BudgetEntity.restore(rows[0] as any);
  }
  async update(id: BudgetId, partial: Partial<BudgetProps>): Promise<BudgetEntity> {
    const keys = Object.keys(partial) as (keyof BudgetProps)[];
    if (keys.length === 0) {
      const found = await this.findById(id);
      if (!found) throw Object.assign(new Error('Budget not found'), { status: 404 });
      return found;
    }
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);
    await query<ResultSetHeader>(`UPDATE budgets SET ${setClause} WHERE id = ?`, params as any);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('Budget not found'), { status: 404 });
    return updated;
  }
  async updateTotal(id: BudgetId, total: number): Promise<void> {
    await query<ResultSetHeader>(`UPDATE budgets SET total = ? WHERE id = ?`, [total, id]);
  }
  async softDelete(id: BudgetId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE budgets SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<BudgetEntity[]> {
    const rows = await query<BudgetProps & RowDataPacket>(`SELECT * FROM budgets WHERE deletedAt IS NULL ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]);
    return rows.map((r: any) => BudgetEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<RowDataPacket & { c: number }>(`SELECT COUNT(*) AS c FROM budgets WHERE deletedAt IS NULL`);
    return Number((rows as any)[0].c ?? 0);
  }
}

export class BudgetVehiclePartMySqlRepository implements BudgetVehiclePartRepository {
  async add(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity> {
    const data = entity.toJSON();
    const sql = `INSERT INTO budget_vehicle_parts (budgetId, vehiclePartId, quantity, price)
                 VALUES (?, ?, ?, ?)`;
    const params = [data.budgetId, data.vehiclePartId, data.quantity, data.price];
    const result = await query<ResultSetHeader>(sql, params);
    const id = (result as any).insertId as number;
    return BudgetVehiclePartEntity.restore({ ...data, id });
  }
  async remove(id: number): Promise<void> {
    await query<ResultSetHeader>(`DELETE FROM budget_vehicle_parts WHERE id = ?`, [id]);
  }
  async listByBudget(budgetId: BudgetId): Promise<BudgetVehiclePartEntity[]> {
    const rows = await query<BudgetVehiclePartProps & RowDataPacket>(`SELECT * FROM budget_vehicle_parts WHERE budgetId = ?`, [budgetId]);
    return rows.map((r) => BudgetVehiclePartEntity.restore(r as any));
  }
}

export class BudgetVehicleServiceMySqlRepository implements BudgetVehicleServiceRepository {
  async add(entity: BudgetVehicleServiceEntity): Promise<BudgetVehicleServiceEntity> {
    const data = entity.toJSON();
    const sql = `INSERT INTO budget_vehicle_services (budgetId, vehicleServiceId, price)
                 VALUES (?, ?, ?)`;
    const params = [data.budgetId, data.vehicleServiceId, data.price];
    const result = await query<ResultSetHeader>(sql, params);
    const id = (result as any).insertId as number;
    return BudgetVehicleServiceEntity.restore({ ...data, id });
  }
  async remove(id: number): Promise<void> {
    await query<ResultSetHeader>(`DELETE FROM budget_vehicle_services WHERE id = ?`, [id]);
  }
  async listByBudget(budgetId: BudgetId): Promise<BudgetVehicleServiceEntity[]> {
    const rows = await query<BudgetVehicleServiceProps & RowDataPacket>(`SELECT * FROM budget_vehicle_services WHERE budgetId = ?`, [budgetId]);
    return rows.map((r) => BudgetVehicleServiceEntity.restore(r as any));
  }
}
