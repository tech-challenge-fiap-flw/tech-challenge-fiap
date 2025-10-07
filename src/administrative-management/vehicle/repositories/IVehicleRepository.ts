import { Vehicle } from '../domain/Vehicle';

export interface IVehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
