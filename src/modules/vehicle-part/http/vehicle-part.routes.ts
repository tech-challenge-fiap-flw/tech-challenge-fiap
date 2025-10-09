import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import {
  CreateVehiclePartController,
  GetVehiclePartController,
  UpdateVehiclePartController,
  DeleteVehiclePartController,
  ListVehiclePartsController,
} from './VehiclePartController';

const repo = new VehiclePartMySqlRepository();

export const vehiclePartRouter = Router();

vehiclePartRouter.post('/', authMiddleware, adaptExpress(new CreateVehiclePartController(repo)));
vehiclePartRouter.get('/:id', authMiddleware, adaptExpress(new GetVehiclePartController(repo)));
vehiclePartRouter.put('/:id', authMiddleware, adaptExpress(new UpdateVehiclePartController(repo)));
vehiclePartRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteVehiclePartController(repo)));
vehiclePartRouter.get('/', authMiddleware, adaptExpress(new ListVehiclePartsController(repo)));