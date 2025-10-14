import { VehicleEntity, VehicleId, IVehicleProps } from './Vehicle';

export interface IVehicleRepository {
  create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  findById(id: VehicleId): Promise<VehicleEntity | null>;
  findByIdPlate(idPlate: string): Promise<VehicleEntity | null>;
  update(id: VehicleId, partial: Partial<IVehicleProps>): Promise<VehicleEntity | null>;
  softDelete(id: VehicleId): Promise<void>;
  list(offset: number, limit: number): Promise<VehicleEntity[]>;
  countAll(): Promise<number>;
}
