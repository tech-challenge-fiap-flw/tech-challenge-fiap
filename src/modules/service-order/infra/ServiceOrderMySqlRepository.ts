import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { ServiceOrderEntity, ServiceOrderId, ServiceOrderProps, ServiceOrderStatus } from '../domain/ServiceOrder';
import { ServiceOrderRepository } from '../domain/ServiceOrderRepository';

export class ServiceOrderMySqlRepository implements ServiceOrderRepository {
  async create(entity: ServiceOrderEntity): Promise<ServiceOrderEntity> {
    const data = entity.toJSON();
    const sql = `INSERT INTO service_orders (description, creationDate, currentStatus, budgetId, customerId, mechanicId, vehicleId, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [data.description, data.creationDate, data.currentStatus, data.budgetId ?? null, data.customerId, data.mechanicId ?? null, data.vehicleId, data.active];
    const result = await query<ResultSetHeader>(sql, params);
    const id = (result as any).insertId as number;
    return ServiceOrderEntity.restore({ ...data, id });
  }

  async findById(id: ServiceOrderId): Promise<ServiceOrderEntity | null> {
    const rows = await query<ServiceOrderProps & RowDataPacket>(`SELECT * FROM service_orders WHERE id = ?`, [id]);
    if (!rows.length) return null;
    return ServiceOrderEntity.restore(rows[0] as any);
  }

  async updateStatus(id: ServiceOrderId, newStatus: ServiceOrderStatus): Promise<ServiceOrderEntity> {
    await query<ResultSetHeader>(`UPDATE service_orders SET currentStatus = ? WHERE id = ?`, [newStatus, id]);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('Service order not found'), { status: 404 });
    return updated;
  }

  async assignMechanic(id: ServiceOrderId, mechanicId: number): Promise<ServiceOrderEntity> {
    await query<ResultSetHeader>(`UPDATE service_orders SET mechanicId = ? WHERE id = ?`, [mechanicId, id]);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('Service order not found'), { status: 404 });
    return updated;
  }

  async softDelete(id: ServiceOrderId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE service_orders SET active = 0 WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<ServiceOrderEntity[]> {
    const rows = await query<ServiceOrderProps & RowDataPacket>(`SELECT * FROM service_orders WHERE active = 1 ORDER BY id LIMIT ? OFFSET ?`, [limit, offset]);
    return rows.map((r: any) => ServiceOrderEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<RowDataPacket & { c: number }>(`SELECT COUNT(*) AS c FROM service_orders WHERE active = 1`);
    return Number((rows as any)[0].c ?? 0);
  }
}
