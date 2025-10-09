import { VehicleEntity, VehicleId, VehicleProps } from './Vehicle';

export interface VehicleRepository {
  create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  findById(id: VehicleId): Promise<VehicleEntity | null>;
  findByIdPlate(idPlate: string): Promise<VehicleEntity | null>;
  update(id: VehicleId, partial: Partial<VehicleProps>): Promise<VehicleEntity>;
  softDelete(id: VehicleId): Promise<void>;
  list(offset: number, limit: number): Promise<VehicleEntity[]>;
  countAll(): Promise<number>;
}
