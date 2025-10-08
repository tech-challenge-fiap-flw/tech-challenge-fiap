import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { validateBody } from '../validators/validate';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { requireRole } from '../../../../auth/interface/http/middlewares/require-role';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';

const { pub, priv, mount: router } = createModuleRouter(authMiddleware);

pub.post('/', validateBody(CreateUserDto), expressHandler(UserController.create));

priv.get('/me', expressHandler(UserController.me));
priv.put('/', requireRole('admin'), validateBody(UpdateUserDto), expressHandler(UserController.update));
priv.delete('/', requireRole('admin'), expressHandler(UserController.remove));

export default router;
