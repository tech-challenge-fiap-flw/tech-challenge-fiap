import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../../../http/asyncHandler';

export function makeAuthRouter(controller: AuthController) {
  const r = Router();

  r.post('/login',   asyncHandler((req, res) => controller.login(req, res)));
  r.post('/refresh', asyncHandler((req, res) => controller.refresh(req, res)));

  return r;
}
