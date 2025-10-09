import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehicleMySqlRepository } from '../infra/VehicleMySqlRepository';
import { VehicleService } from '../application/VehicleService';
import { 
  CreateVehicleController,
  GetVehicleController,
  UpdateVehicleController,
  DeleteVehicleController,
  ListVehiclesController,
} from './VehicleController';

const repo = new VehicleMySqlRepository();
const service = new VehicleService(repo);

export const vehicleRouter = Router();

vehicleRouter.post('/', authMiddleware, adaptExpress(new CreateVehicleController(service)));
vehicleRouter.get('/:id', authMiddleware, adaptExpress(new GetVehicleController(repo)));
vehicleRouter.put('/:id', authMiddleware, adaptExpress(new UpdateVehicleController(service)));
vehicleRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteVehicleController(service)));
vehicleRouter.get('/', authMiddleware, adaptExpress(new ListVehiclesController(repo)));