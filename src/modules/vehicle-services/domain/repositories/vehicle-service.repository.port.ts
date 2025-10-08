import { VehicleServiceEntity } from '../entities/vehicle-service';

export interface VehicleServiceRepositoryPort {
  create(data: Omit<VehicleServiceEntity, 'id' | 'deletedAt'>): Promise<VehicleServiceEntity>;
  findAll(): Promise<VehicleServiceEntity[]>;
  findById(id: number): Promise<VehicleServiceEntity | null>;
  update(id: number, data: Partial<Omit<VehicleServiceEntity, 'id' | 'deletedAt'>>): Promise<VehicleServiceEntity>;
  softDelete(id: number): Promise<void>;
  findByIds(ids: number[]): Promise<VehicleServiceEntity[]>;
}
