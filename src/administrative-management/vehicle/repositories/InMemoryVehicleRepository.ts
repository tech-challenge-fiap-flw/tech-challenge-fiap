import { IVehicleRepository } from './IVehicleRepository';
import { Vehicle } from '../domain/Vehicle';

export class InMemoryVehicleRepository implements IVehicleRepository {
  private items: Vehicle[] = [];

  async create(vehicle: Vehicle): Promise<Vehicle> {
    this.items.push(vehicle);
    return vehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    return [...this.items];
  }

  async findById(id: string): Promise<Vehicle | null> {
    const v = this.items.find(i => i.id === id);
    return v ?? null;
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const v = this.items.find(i => i.plate === plate);
    return v ?? null;
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const idx = this.items.findIndex(i => i.id === vehicle.id);
    if (idx === -1) throw new Error('Vehicle not found');
    this.items[idx] = vehicle;
    return vehicle;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter(i => i.id !== id);
  }
}
