import { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { BudgetVehiclePartPort } from '../../domain/ports/budget-vehicle-part.port';
import { FindBudgetByIdUseCase } from './find-budget-by-id.usecase';

export class RemoveBudgetUseCase {
  constructor(
    private repo: BudgetRepositoryPort,
    private bvp: BudgetVehiclePartPort,
    private findById: FindBudgetByIdUseCase,
  ) {}

  async execute(id: number) {
    const budget = await this.findById.execute(id, true);
    if (budget.vehicleParts?.length) {
      await this.bvp.remove(budget.vehicleParts.map(p => ({ id: p.id })));
    }
    await this.repo.softDelete(id);
  }
}
