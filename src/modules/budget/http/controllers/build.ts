import { BudgetService } from '../../application/BudgetService';
import { BudgetMySqlRepository, BudgetVehiclePartMySqlRepository, BudgetVehicleServiceMySqlRepository } from '../../infra/BudgetMySqlRepositories';

export function buildBudgetService() {
  const budgetRepo = new BudgetMySqlRepository();
  const partRepo = new BudgetVehiclePartMySqlRepository();
  const serviceRepo = new BudgetVehicleServiceMySqlRepository();
  return { budgetRepo, service: new BudgetService(budgetRepo, partRepo, serviceRepo) };
}
