import { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { Budget } from '../../domain/entities/budget';

export class FindBudgetByIdUseCase {
  constructor(private repo: BudgetRepositoryPort) {}

  async execute(id: number, withParts: boolean, user?: { id: number; roles?: string[] }): Promise<Budget> {
    const result = await this.repo.findById(id, withParts, user);
    if (!result) {
      const err: any = new Error(`Budget with id ${id} not found`);
      err.status = 404;
      throw err;
    }
    return result;
  }
}
