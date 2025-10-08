import { BudgetEntity, BudgetId } from '../domain/Budget';
import { BudgetRepository, BudgetVehiclePartRepository, BudgetVehicleServiceRepository } from '../domain/BudgetRepositories';
import { BudgetVehiclePartEntity } from '../domain/BudgetVehiclePart';
import { BudgetVehicleServiceEntity } from '../domain/BudgetVehicleService';

export class BudgetService {
  constructor(
    private readonly budgetRepo: BudgetRepository,
    private readonly partRepo: BudgetVehiclePartRepository,
    private readonly serviceRepo: BudgetVehicleServiceRepository,
  ) {}

  async createBudget(input: Omit<ReturnType<BudgetEntity['toJSON']>, 'id' | 'total' | 'creationDate' | 'deletedAt'>) {
    const entity = BudgetEntity.create(input as any);
    const created = await this.budgetRepo.create(entity);
    return created.toJSON();
  }

  async addPart(budgetId: BudgetId, vehiclePartId: number, quantity: number, price: number) {
    const entry = BudgetVehiclePartEntity.create({ budgetId, vehiclePartId, quantity, price });
    await this.partRepo.add(entry);
    await this.recomputeTotal(budgetId);
  }

  async addService(budgetId: BudgetId, vehicleServiceId: number, price: number) {
    const entry = BudgetVehicleServiceEntity.create({ budgetId, vehicleServiceId, price });
    await this.serviceRepo.add(entry);
    await this.recomputeTotal(budgetId);
  }

  async removePart(entryId: number, budgetId: BudgetId) {
    await this.partRepo.remove(entryId);
    await this.recomputeTotal(budgetId);
  }

  async removeService(entryId: number, budgetId: BudgetId) {
    await this.serviceRepo.remove(entryId);
    await this.recomputeTotal(budgetId);
  }

  private async recomputeTotal(budgetId: BudgetId) {
    const parts = await this.partRepo.listByBudget(budgetId);
    const services = await this.serviceRepo.listByBudget(budgetId);
    const total = parts.reduce((sum, p) => sum + p.toJSON().price * p.toJSON().quantity, 0) +
                  services.reduce((sum, s) => sum + s.toJSON().price, 0);
    await this.budgetRepo.updateTotal(budgetId, total);
  }
}
