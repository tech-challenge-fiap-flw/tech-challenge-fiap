import { createModuleRouter, asyncHandler as ah } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { validateBody } from '../validators/validate';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

const { pub, priv, mount: router } = createModuleRouter(authMiddleware);

pub.post('/', validateBody(CreateUserDto), ah(UserController.create));

priv.get('/me', ah(UserController.me));
priv.put('/', validateBody(UpdateUserDto), ah(UserController.update));
priv.delete('/', ah(UserController.remove));

export default router;
