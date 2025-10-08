import { Vehicle } from '../entities/vehicle';

export interface VehicleRepositoryPort {
  create(data: Omit<Vehicle, 'id' | 'deletedAt'>): Promise<Vehicle>;
  findAll(where?: Partial<Pick<Vehicle, 'ownerId'>>): Promise<Vehicle[]>;
  findById(id: number, where?: Partial<Pick<Vehicle, 'ownerId'>>): Promise<Vehicle | null>;
  update(id: number, data: Partial<Omit<Vehicle, 'id' | 'ownerId'>>): Promise<Vehicle>;
  softDelete(id: number): Promise<void>;
  existsByIdPlate(idPlate: string): Promise<boolean>;
}
