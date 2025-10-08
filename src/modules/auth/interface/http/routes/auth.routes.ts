import { createModuleRouter } from '../../../../../shared/http/router-helpers';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';

const { pub, priv, mount: router } = createModuleRouter(authMiddleware);

pub.post('/login', validateBody(LoginDto), expressHandler(AuthController.login));

priv.post('/refresh', validateBody(RefreshDto), expressHandler(AuthController.refresh));
priv.post('/logout', validateBody(RefreshDto), expressHandler(AuthController.logout));

export default router;