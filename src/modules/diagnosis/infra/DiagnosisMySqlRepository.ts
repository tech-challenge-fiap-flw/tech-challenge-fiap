import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { DiagnosisEntity, DiagnosisId, DiagnosisProps } from '../domain/Diagnosis';
import { DiagnosisRepository } from '../domain/DiagnosisRepository';

export class DiagnosisMySqlRepository implements DiagnosisRepository {
  async create(entity: DiagnosisEntity): Promise<DiagnosisEntity> {
    const data = entity.toJSON();

    const sql = `INSERT INTO diagnosis (description, creationDate, vehicleId, responsibleMechanicId, deletedAt)
                 VALUES (?, ?, ?, ?, ?)`;

    const params = [
      data.description,
      data.creationDate,
      data.vehicleId,
      data.responsibleMechanicId ?? null,
      data.deletedAt ?? null
    ];

    const results = await query<ResultSetHeader>(sql, params);
    const id = results.at(0)?.insertId as DiagnosisId;

    return DiagnosisEntity.restore({ ...data, id });
  }

  async findById(id: DiagnosisId): Promise<DiagnosisEntity | null> {
    const rows = await query<DiagnosisProps & RowDataPacket[]>(`SELECT * FROM diagnosis WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return null;
    }

    return DiagnosisEntity.restore(rows[0]);
  }

  async update(id: DiagnosisId, partial: Partial<DiagnosisProps>): Promise<DiagnosisEntity> {
    const keys = Object.keys(partial) as (keyof DiagnosisProps)[];

    if (keys.length === 0) {
      const found = await this.findById(id);

      if (!found) {
        throw Object.assign(new Error('Diagnosis not found'), { status: 404 });
      }

      return found;
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await query<ResultSetHeader>(`UPDATE diagnosis SET ${setClause} WHERE id = ?`, params);

    const updated = await this.findById(id);

    if (!updated) {
      throw Object.assign(new Error('Diagnosis not found'), { status: 404 });
    }

    return updated;
  }

  async softDelete(id: DiagnosisId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE diagnosis SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<DiagnosisEntity[]> {
    const rows = await query<DiagnosisProps & RowDataPacket[]>(
      `SELECT * FROM diagnosis WHERE deletedAt IS NULL ORDER BY id LIMIT ? OFFSET ?`, 
      [limit, offset]
    );

    return rows.map((r) => DiagnosisEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM diagnosis WHERE deletedAt IS NULL`);

    return Number(rows.at(0)?.c ?? 0);
  }
}