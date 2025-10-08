import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { VehiclePartEntity, VehiclePartId, VehiclePartProps } from '../domain/VehiclePart';
import { VehiclePartRepository } from '../domain/VehiclePartRepository';

export class VehiclePartMySqlRepository implements VehiclePartRepository {
  async create(part: VehiclePartEntity): Promise<VehiclePartEntity> {
    const data = part.toJSON();
    const sql = `INSERT INTO vehicle_parts (type, name, description, quantity, price, deletedAt, creationDate)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [data.type, data.name, data.description, data.quantity, data.price, data.deletedAt ?? null, data.creationDate ?? new Date()];
    const result = await query<ResultSetHeader>(sql, params);
    const id = (result as any).insertId as number;
    return VehiclePartEntity.restore({ ...data, id });
  }
  async findById(id: VehiclePartId): Promise<VehiclePartEntity | null> {
    const rows = await query<VehiclePartProps & RowDataPacket>(`SELECT * FROM vehicle_parts WHERE id = ?`, [id]);
    if (!rows.length) return null;
    return VehiclePartEntity.restore(rows[0] as any);
  }
  async update(id: VehiclePartId, partial: Partial<VehiclePartProps>): Promise<VehiclePartEntity> {
    const keys = Object.keys(partial) as (keyof VehiclePartProps)[];
    if (keys.length === 0) {
      const found = await this.findById(id);
      if (!found) throw Object.assign(new Error('Vehicle part not found'), { status: 404 });
      return found;
    }
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);
    await query<ResultSetHeader>(`UPDATE vehicle_parts SET ${setClause} WHERE id = ?`, params as any);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('Vehicle part not found'), { status: 404 });
    return updated;
  }
  async softDelete(id: VehiclePartId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE vehicle_parts SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<VehiclePartEntity[]> {
    const rows = await query<VehiclePartProps & RowDataPacket>(`SELECT * FROM vehicle_parts WHERE deletedAt IS NULL ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]);
    return rows.map((r: any) => VehiclePartEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<RowDataPacket & { c: number }>(`SELECT COUNT(*) AS c FROM vehicle_parts WHERE deletedAt IS NULL`);
    return Number((rows as any)[0].c ?? 0);
  }
}
