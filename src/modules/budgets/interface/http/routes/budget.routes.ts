import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { requireRole } from '../../../../auth/interface/http/middlewares/require-role';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { BudgetController } from '../controllers/budget.controller';

const { priv, mount: router } = createModuleRouter(authMiddleware);

priv.post('/', requireRole('admin'), validateBody(CreateBudgetDto), expressHandler(BudgetController.create));
// priv.put('/:id', requireRole('admin'), validateBody(UpdateBudgetDto), expressHandler(BudgetController.update));
// priv.get('/:id', expressHandler(BudgetController.findOne));
// priv.delete('/:id', requireRole('admin'), expressHandler(BudgetController.remove));
// priv.post('/:id/accept', validateBody(AcceptBudgetDto), expressHandler(BudgetController.decideBudget));

export default router;
