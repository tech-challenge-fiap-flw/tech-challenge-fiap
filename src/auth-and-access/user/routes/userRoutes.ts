import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { asyncHandler } from '../../../http/asyncHandler';

export function makeUserRouter(controller: UserController) {
  const r = Router();
  r.post('/', asyncHandler((req, res) => controller.create(req, res)));
  r.get('/me', asyncHandler((req, res) => controller.me(req, res)));
  r.put('/', asyncHandler((req, res) => controller.update(req, res)));
  r.delete('/', asyncHandler((req, res) => controller.remove(req, res)));
  return r;
}
