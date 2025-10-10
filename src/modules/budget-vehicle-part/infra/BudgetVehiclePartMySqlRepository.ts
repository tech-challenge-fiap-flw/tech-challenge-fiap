import * as mysql from '../../../infra/db/mysql';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import { IBudgetVehiclePartRepository } from '../domain/IBudgetVehiclePartRepository';

export class BudgetVehiclePartMySqlRepository implements IBudgetVehiclePartRepository {
  async create(entity: BudgetVehiclePartEntity): Promise<BudgetVehiclePartEntity> {
    const data = entity.toJSON();

    const sql = `
      INSERT INTO budget_vehicle_parts 
      (budgetId, vehiclePartId, quantity) 
      VALUES (?, ?, ?)
    `;

    const params = [
      data.budgetId,
      data.vehiclePartId,
      data.quantity
    ];

    const result = await mysql.insertOne(sql, params);

    return BudgetVehiclePartEntity.restore({ ...data, id: result.insertId });
  }

  async bulkCreate(entities: BudgetVehiclePartEntity[]): Promise<BudgetVehiclePartEntity[]> {
    const createdEntities: BudgetVehiclePartEntity[] = [];

    for (const entity of entities) {
      const created = await this.create(entity);
      createdEntities.push(created);
    }

    return createdEntities;
  }
}
