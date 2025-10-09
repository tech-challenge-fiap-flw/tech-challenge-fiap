import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import {
  CreateVehicleServiceController,
  GetVehicleServiceController,
  UpdateVehicleServiceController,
  DeleteVehicleServiceController,
  ListVehicleServicesController,
} from './VehicleServiceController';

const repo = new VehicleServiceMySqlRepository();

export const vehicleServiceRouter = Router();

vehicleServiceRouter.post('/', authMiddleware, adaptExpress(new CreateVehicleServiceController(repo)));
vehicleServiceRouter.get('/:id', authMiddleware, adaptExpress(new GetVehicleServiceController(repo)));
vehicleServiceRouter.put('/:id', authMiddleware, adaptExpress(new UpdateVehicleServiceController(repo)));
vehicleServiceRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteVehicleServiceController(repo)));
vehicleServiceRouter.get('/', authMiddleware, adaptExpress(new ListVehicleServicesController(repo)));