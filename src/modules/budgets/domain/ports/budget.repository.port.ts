import { Budget } from '../entities/budget';

export interface BudgetRepositoryPort {
  create(data: Omit<Budget, 'id' | 'deletedAt' | 'creationDate' | 'total' | 'vehicleParts'> & {
    vehicleParts: { id: number; quantity: number }[];
    vehicleServicesIds: number[];
    total: number;
  }): Promise<Budget>;

  findById(id: number, withParts: boolean, user?: { id: number; roles?: string[] }): Promise<Budget | null>;

  updateCore(id: number, data: { description?: string }): Promise<void>;
  softDelete(id: number): Promise<void>;
}
