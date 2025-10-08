import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { DiagnosisController } from '../controllers/diagnosis.controller';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';
import { createModuleRouter } from '../../../../../shared/http/router-helpers';

const { priv, mount: router } = createModuleRouter(authMiddleware);

priv.post('/', validateBody(CreateDiagnosisDto), expressHandler(DiagnosisController.create));
priv.get('/:id', expressHandler(DiagnosisController.findOne));

export default router;
