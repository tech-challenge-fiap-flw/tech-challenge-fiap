import { IVehicleRepository } from './IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';

export class InMemoryVehicleRepository implements IVehicleRepository {
  private items: Vehicle[] = [];
  private seq = 1;

  nextId(): number { return this.seq++; }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    this.items.push(vehicle);
    return vehicle;
  }

  async findAll(includeDeleted = false): Promise<Vehicle[]> {
    const list = includeDeleted ? this.items : this.items.filter(v => !v.deletedAt);
    return [...list];
  }

  async findById(id: number, includeDeleted = false): Promise<Vehicle | null> {
    const v = this.items.find(i => i.id === id);
    if (!v) return null;
    if (!includeDeleted && v.deletedAt) return null;
    return v;
  }


  async findByIdPlate(idPlate: string, includeDeleted = false): Promise<Vehicle | null> {
    const v = this.items.find(i => i.idPlate === idPlate);
    if (!v) return null;
    if (!includeDeleted && v.deletedAt) return null;
    return v;
  }


  async update(vehicle: Vehicle): Promise<Vehicle> {
    const idx = this.items.findIndex(i => i.id === vehicle.id);
    if (idx === -1) throw new Error('Vehicle not found');
    this.items[idx] = vehicle;
    return vehicle;
  }


  async softDelete(id: number): Promise<void> {
    const v = this.items.find(i => i.id === id);
    if (v) v.deletedAt = new Date();
  }
}