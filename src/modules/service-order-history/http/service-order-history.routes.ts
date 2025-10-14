import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { ServiceOrderHistoryMongoRepository } from '../infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderHistoryService } from '../application/ServiceOrderHistoryService';
import { LogServiceOrderHistoryController } from './controllers/LogServiceOrderHistoryController';
import { ListServiceOrderHistoryController } from './controllers/ListServiceOrderHistoryController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';

const repository = new ServiceOrderHistoryMongoRepository();
const service = new ServiceOrderHistoryService(repository);

export const serviceOrderHistoryRouter = Router();

serviceOrderHistoryRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new LogServiceOrderHistoryController(service)));
serviceOrderHistoryRouter.get('/:idServiceOrder', authMiddleware, requireRole('admin'), adaptExpress(new ListServiceOrderHistoryController(service)));
