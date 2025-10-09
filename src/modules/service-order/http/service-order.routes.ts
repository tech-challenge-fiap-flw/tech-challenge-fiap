import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import {
  AssignMechanicController,
  ChangeStatusController,
  CreateServiceOrderController,
  DeleteServiceOrderController,
  GetServiceOrderController,
  ListServiceOrdersController,
  buildServiceOrderService,
} from './ServiceOrderController';

const { repo, service } = buildServiceOrderService();

export const serviceOrderRouter = Router();

serviceOrderRouter.post('/', authMiddleware, adaptExpress(new CreateServiceOrderController(repo)));
serviceOrderRouter.get('/:id', authMiddleware, adaptExpress(new GetServiceOrderController(repo)));
serviceOrderRouter.post('/:id/status', authMiddleware, requireRole('admin'), adaptExpress(new ChangeStatusController(service)));
serviceOrderRouter.post('/:id/assign/:mechanicId', authMiddleware, requireRole('admin'), adaptExpress(new AssignMechanicController(service)));
serviceOrderRouter.delete('/:id', authMiddleware, requireRole('admin'), adaptExpress(new DeleteServiceOrderController(service)));
serviceOrderRouter.get('/', authMiddleware, requireRole('admin'), adaptExpress(new ListServiceOrdersController(repo)));