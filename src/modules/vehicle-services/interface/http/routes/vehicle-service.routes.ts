import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';
import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { requireRole } from '../../../../auth/interface/http/middlewares/require-role';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { VehicleServiceController } from '../controllers/vehicle-service.controller';
import { CreateVehicleServiceDto } from '../dto/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update-vehicle-service.dto';

const { priv, mount: router } = createModuleRouter(authMiddleware);

priv.post('/', requireRole('admin'), validateBody(CreateVehicleServiceDto), expressHandler(VehicleServiceController.create));
priv.put('/:id', requireRole('admin'), validateBody(UpdateVehicleServiceDto), expressHandler(VehicleServiceController.update));
priv.delete('/:id', requireRole('admin'), expressHandler(VehicleServiceController.remove));

priv.get('/', expressHandler(VehicleServiceController.findAll));
priv.get('/:id', expressHandler(VehicleServiceController.findOne));

export default router;
