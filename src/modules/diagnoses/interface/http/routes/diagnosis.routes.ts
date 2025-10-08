import { Router } from 'express';
import { authMiddleware } from '../../../../auth/interface/http/middlewares/auth.middleware';
import { validateBody } from '../../../../users/interface/http/validators/validate';
import { DiagnosisController } from '../controllers/diagnosis.controller';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { expressHandler } from '../../../../../shared/http/adapters/express.adapter';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(CreateDiagnosisDto), expressHandler(DiagnosisController.create));
router.get('/:id', expressHandler(DiagnosisController.findOne));

export default router;
