import { VehiclePartEntity, VehiclePartId, VehiclePartProps } from './VehiclePart';

export interface VehiclePartRepository {
  create(part: VehiclePartEntity): Promise<VehiclePartEntity>;
  findById(id: VehiclePartId): Promise<VehiclePartEntity | null>;
  update(id: VehiclePartId, partial: Partial<VehiclePartProps>): Promise<VehiclePartEntity | null>;
  softDelete(id: VehiclePartId): Promise<void>;
  list(offset: number, limit: number): Promise<VehiclePartEntity[]>;
  countAll(): Promise<number>;
}
