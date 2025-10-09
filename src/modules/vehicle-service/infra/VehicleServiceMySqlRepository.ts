import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { VehicleServiceEntity, VehicleServiceId, VehicleServiceProps } from '../domain/VehicleService';
import { VehicleServiceRepository } from '../domain/VehicleServiceRepository';

export class VehicleServiceMySqlRepository implements VehicleServiceRepository {
  async create(entity: VehicleServiceEntity): Promise<VehicleServiceEntity> {
    const data = entity.toJSON();
    
    const sql = `INSERT INTO vehicle_services (name, price, description, deletedAt)
                 VALUES (?, ?, ?, ?)`;
                 
    const params = [
      data.name,
      data.price,
      data.description ?? null,
      data.deletedAt ?? null
    ];

    const results = await query<ResultSetHeader>(sql, params);
    const id = results.at(0)?.insertId as VehicleServiceId;
    
    return VehicleServiceEntity.restore({ ...data, id });
  }

  async findById(id: VehicleServiceId): Promise<VehicleServiceEntity | null> {
    const rows = await query<VehicleServiceProps & RowDataPacket[]>(`SELECT * FROM vehicle_services WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return VehicleServiceEntity.restore(rows[0]);
  }

  async update(id: VehicleServiceId, partial: Partial<VehicleServiceProps>): Promise<VehicleServiceEntity> {
    const keys = Object.keys(partial) as (keyof VehicleServiceProps)[];

    if (keys.length === 0) {
      const found = await this.findById(id);
      
      if (!found) {
        throw Object.assign(new Error('Vehicle service not found'), { status: 404 });
      }
      
      return found;
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await query<ResultSetHeader>(`UPDATE vehicle_services SET ${setClause} WHERE id = ?`, params);
    
    const updated = await this.findById(id);
    
    if (!updated) {
      throw Object.assign(new Error('Vehicle service not found'), { status: 404 });
    }
    
    return updated;
  }

  async softDelete(id: VehicleServiceId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE vehicle_services SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<VehicleServiceEntity[]> {
    const rows = await query<VehicleServiceProps & RowDataPacket[]>(
      `SELECT * FROM vehicle_services WHERE deletedAt IS NULL ORDER BY id LIMIT ? OFFSET ?`, 
      [limit, offset]
    );
    
    return rows.map((r) => VehicleServiceEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM vehicle_services WHERE deletedAt IS NULL`);
    
    return Number(rows.at(0)?.c ?? 0);
  }
}