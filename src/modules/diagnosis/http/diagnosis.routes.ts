import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { DiagnosisMySqlRepository } from '../infra/DiagnosisMySqlRepository';
import {
  CreateDiagnosisController,
  GetDiagnosisController,
  UpdateDiagnosisController,
  DeleteDiagnosisController,
  ListDiagnosesController,
} from './DiagnosisController';

const repo = new DiagnosisMySqlRepository();

export const diagnosisRouter = Router();

diagnosisRouter.post('/', authMiddleware, adaptExpress(new CreateDiagnosisController(repo)));
diagnosisRouter.get('/:id', authMiddleware, adaptExpress(new GetDiagnosisController(repo)));
diagnosisRouter.put('/:id', authMiddleware, adaptExpress(new UpdateDiagnosisController(repo)));
diagnosisRouter.delete('/:id', authMiddleware, adaptExpress(new DeleteDiagnosisController(repo)));
diagnosisRouter.get('/', authMiddleware, adaptExpress(new ListDiagnosesController(repo)));