import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import {
  AddPartController,
  AddServiceController,
  CreateBudgetController,
  GetBudgetController,
  ListBudgetsController,
  RemovePartController,
  RemoveServiceController,
  buildBudgetService,
} from './BudgetController';

const { budgetRepo, service } = buildBudgetService();

export const budgetRouter = Router();

budgetRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateBudgetController(service)));
budgetRouter.get('/:id', authMiddleware, adaptExpress(new GetBudgetController(budgetRepo)));
budgetRouter.post('/:id/parts', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new AddPartController(service)));
budgetRouter.post('/:id/services', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new AddServiceController(service)));
budgetRouter.delete('/:id/parts/:entryId', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new RemovePartController(service)));
budgetRouter.delete('/:id/services/:entryId', authMiddleware, requireRole('admin', 'mechanic'), adaptExpress(new RemoveServiceController(service)));
budgetRouter.get('/', authMiddleware, requireRole('admin'), adaptExpress(new ListBudgetsController(budgetRepo)));