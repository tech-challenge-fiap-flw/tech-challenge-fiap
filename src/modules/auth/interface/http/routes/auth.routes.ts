import { createModuleRouter, asyncHandler as ah } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';

const { pub, priv, mount: router } = createModuleRouter(authMiddleware);

pub.post('/login', validateBody(LoginDto), ah(AuthController.login));

priv.post('/refresh', validateBody(RefreshDto), ah(AuthController.refresh));
priv.post('/logout', validateBody(RefreshDto), ah(AuthController.logout));

export default router;