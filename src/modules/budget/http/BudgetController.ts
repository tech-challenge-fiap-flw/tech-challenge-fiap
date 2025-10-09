export { CreateBudgetController } from './controllers/CreateBudgetController';
export { GetBudgetController } from './controllers/GetBudgetController';
export { AddPartController } from './controllers/AddPartController';
export { AddServiceController } from './controllers/AddServiceController';
export { RemovePartController } from './controllers/RemovePartController';
export { RemoveServiceController } from './controllers/RemoveServiceController';
export { ListBudgetsController } from './controllers/ListBudgetsController';
// Re-export build factory (inlined fallback to avoid resolution glitches)
// buildBudgetService inlined to avoid path resolution issues
import { BudgetService } from '../application/BudgetService';
import { BudgetMySqlRepository, BudgetVehiclePartMySqlRepository, BudgetVehicleServiceMySqlRepository } from '../infra/BudgetMySqlRepositories';
export function buildBudgetService() {
	const budgetRepo = new BudgetMySqlRepository();
	const partRepo = new BudgetVehiclePartMySqlRepository();
	const serviceRepo = new BudgetVehicleServiceMySqlRepository();
	return { budgetRepo, service: new BudgetService(budgetRepo, partRepo, serviceRepo) };
}
