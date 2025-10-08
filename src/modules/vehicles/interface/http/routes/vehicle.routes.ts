import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { VehicleController } from '../controllers/vehicle.controller';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { requireRole } from '../../../../auth/interface/http/middlewares/require-role';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';

const { priv, mount: router } = createModuleRouter(authMiddleware);

priv.post('/', validateBody(CreateVehicleDto), expressHandler(VehicleController.create));
priv.get('/', requireRole('admin'), expressHandler(VehicleController.findAll));
priv.get('/:id', expressHandler(VehicleController.findOne));
priv.put('/:id', validateBody(UpdateVehicleDto), expressHandler(VehicleController.update));
priv.delete('/:id', requireRole('admin'), expressHandler(VehicleController.remove));

export default router;
