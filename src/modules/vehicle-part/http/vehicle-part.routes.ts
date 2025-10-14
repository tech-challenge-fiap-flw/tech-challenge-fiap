import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import { VehiclePartService } from '../application/VehiclePartService';
import { CreateVehiclePartController } from './controllers/CreateVehiclePartController';
import { GetVehiclePartController } from './controllers/GetVehiclePartController';
import { UpdateVehiclePartController } from './controllers/UpdateVehiclePartController';
import { DeleteVehiclePartController } from './controllers/DeleteVehiclePartController';
import { ListVehiclePartsController } from './controllers/ListVehiclePartsController';

const repository = new VehiclePartMySqlRepository();
const service = new VehiclePartService(repository);

export const vehiclePartRouter = Router();

vehiclePartRouter.post('/', authMiddleware, adaptExpress(new CreateVehiclePartController(service)));
vehiclePartRouter.get('/:id', authMiddleware, adaptExpress(new GetVehiclePartController(service)));
vehiclePartRouter.put('/:id', authMiddleware, adaptExpress(new UpdateVehiclePartController(service)));
vehiclePartRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteVehiclePartController(service)));
vehiclePartRouter.get('/', authMiddleware, adaptExpress(new ListVehiclePartsController(service)));