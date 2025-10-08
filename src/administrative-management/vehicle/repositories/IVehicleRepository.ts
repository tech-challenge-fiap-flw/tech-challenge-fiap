import { Vehicle } from '../domain/Vehicle';

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findAll(includeDeleted?: boolean): Promise<Vehicle[]>;
  findById(id: number, includeDeleted?: boolean): Promise<Vehicle | null>;
  findByIdPlate(idPlate: string, includeDeleted?: boolean): Promise<Vehicle | null>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  softDelete(id: number): Promise<void>;
  nextId(): number;
}