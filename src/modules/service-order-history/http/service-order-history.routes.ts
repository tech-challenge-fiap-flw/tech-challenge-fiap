import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { ServiceOrderHistoryMongoRepository } from '../infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderHistoryService } from '../application/ServiceOrderHistoryService';
import { LogServiceOrderHistoryController } from './controllers/LogServiceOrderHistoryController';
import { ListServiceOrderHistoryController } from './controllers/ListServiceOrderHistoryController';

const repository = new ServiceOrderHistoryMongoRepository();
const service = new ServiceOrderHistoryService(repository);

export const serviceOrderHistoryRouter = Router();

serviceOrderHistoryRouter.post('/', authMiddleware, adaptExpress(new LogServiceOrderHistoryController(service)));
serviceOrderHistoryRouter.get('/:idServiceOrder', authMiddleware, adaptExpress(new ListServiceOrderHistoryController(service)));
