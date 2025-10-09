import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { VehicleEntity, VehicleId, VehicleProps } from '../domain/Vehicle';
import { VehicleRepository } from '../domain/VehicleRepository';

export class VehicleMySqlRepository implements VehicleRepository {
  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const data = vehicle.toJSON();
    
    const sql = `INSERT INTO vehicles (idPlate, type, model, brand, manufactureYear, modelYear, color, ownerId, deletedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                 
    const params = [
      data.idPlate,
      data.type,
      data.model,
      data.brand,
      data.manufactureYear,
      data.modelYear,
      data.color,
      data.ownerId,
      data.deletedAt ?? null,
    ];

    const results = await query<ResultSetHeader>(sql, params);
    const id = results.at(0)?.insertId as VehicleId;
    
    return VehicleEntity.restore({ ...data, id });
  }

  async findById(id: VehicleId): Promise<VehicleEntity | null> {
    const rows = await query<VehicleProps & RowDataPacket[]>(`SELECT * FROM vehicles WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return VehicleEntity.restore(rows[0]);
  }

  async findByIdPlate(idPlate: string): Promise<VehicleEntity | null> {
    const rows = await query<VehicleProps & RowDataPacket[]>(`SELECT * FROM vehicles WHERE idPlate = ?`, [idPlate]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return VehicleEntity.restore(rows[0]);
  }

  async update(id: VehicleId, partial: Partial<VehicleProps>): Promise<VehicleEntity> {
    const keys = Object.keys(partial) as (keyof VehicleProps)[];

    if (keys.length === 0) {
      const found = await this.findById(id);
      
      if (!found) {
        throw Object.assign(new Error('Vehicle not found'), { status: 404 });
      }
      
      return found;
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await query<ResultSetHeader>(`UPDATE vehicles SET ${setClause} WHERE id = ?`, params);
    
    const updated = await this.findById(id);
    
    if (!updated) {
      throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    }
    
    return updated;
  }

  async softDelete(id: VehicleId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE vehicles SET deletedAt = NOW() WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<VehicleEntity[]> {
    const rows = await query<VehicleProps & RowDataPacket[]>(
      `SELECT * FROM vehicles WHERE deletedAt IS NULL ORDER BY id LIMIT ? OFFSET ?`, 
      [limit, offset]
    );
    
    return rows.map((r) => VehicleEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM vehicles WHERE deletedAt IS NULL`);

    return Number(rows.at(0)?.c ?? 0);
  }
}