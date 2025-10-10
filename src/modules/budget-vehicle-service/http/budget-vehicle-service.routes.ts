import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { BudgetVehicleServiceMySqlRepository } from '../infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceService } from '../application/BudgetVehicleServiceService';
import { CreateBudgetVehicleServiceController } from './controllers/CreateBudgetVehicleServiceController';
import { authMiddleware } from '../../../modules/auth/AuthMiddleware';
import { UpdateBudgetVehicleServiceController } from './controllers/UpdateBudgetVehicleServiceController';
import { GetBudgetVehicleServiceController } from './controllers/GetBudgetVehicleServiceController';
import { DeleteBudgetVehicleServiceController } from './controllers/DeleteCurrentUserController';

const repository = new BudgetVehicleServiceMySqlRepository();
const service = new BudgetVehicleServiceService(repository);

export const budgetVehicleServiceRouter = Router();

budgetVehicleServiceRouter.post('/', adaptExpress(new CreateBudgetVehicleServiceController(service)));
budgetVehicleServiceRouter.put('/:id', authMiddleware, adaptExpress(new UpdateBudgetVehicleServiceController(service)));
budgetVehicleServiceRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteBudgetVehicleServiceController(service)));
// budgetVehicleServiceRouter.get('/me', authMiddleware, adaptExpress(new GetUserProfileController(service)));
budgetVehicleServiceRouter.get('/:id', authMiddleware, adaptExpress(new GetBudgetVehicleServiceController(service)));
// userRouter.get('/', authMiddleware, requireRole('admin'), adaptExpress(new ListUsersController(service)));