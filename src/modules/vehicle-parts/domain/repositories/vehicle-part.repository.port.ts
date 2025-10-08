import { VehiclePart } from '../entities/vehicle-part';

export interface VehiclePartRepositoryPort {
  create(data: Omit<VehiclePart, 'id' | 'deletedAt' | 'creationDate'>): Promise<VehiclePart>;
  findById(id: number): Promise<VehiclePart | null>;
  findByNameLike(name: string): Promise<VehiclePart[]>;
  findByIds(ids: number[]): Promise<VehiclePart[]>;
  update(id: number, data: Partial<Omit<VehiclePart, 'id' | 'creationDate' | 'deletedAt'>>): Promise<VehiclePart>;
  softDelete(id: number): Promise<void>;
}
