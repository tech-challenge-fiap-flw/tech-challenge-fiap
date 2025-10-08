import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { requireRole } from '../../../../auth/interface/http/middlewares/require-role';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { VehiclePartController } from '../controllers/vehicle-part.controller';
import { CreateVehiclePartDto } from '../dto/create-vehicle-part.dto';
import { UpdateVehiclePartDto } from '../dto/update-vehicle-part.dto';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';

const { priv, mount: router } = createModuleRouter(authMiddleware);

priv.get('/search', expressHandler(VehiclePartController.findByNameLike));
priv.post('/', requireRole('admin'), validateBody(CreateVehiclePartDto), expressHandler(VehiclePartController.create));
priv.put('/:id', requireRole('admin'), validateBody(UpdateVehiclePartDto), expressHandler(VehiclePartController.update));
priv.delete('/:id', requireRole('admin'), expressHandler(VehiclePartController.remove));

export default router;
