import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { asyncHandler } from '../../../http/asyncHandler';
import { rolesGuard } from '../../../auth-and-access/auth/middleware/rolesGuard';

export function makeVehicleRouter(controller: VehicleController) {
  const r = Router();

  r.post('/', asyncHandler((req, res) => controller.create(req, res)));
  r.get('/', asyncHandler((req, res) => controller.list(req, res)));
  r.get('/:id', asyncHandler((req, res) => controller.get(req, res)));
  r.put('/:id', asyncHandler((req, res) => controller.update(req, res)));
  r.delete('/:id', rolesGuard(['admin']), asyncHandler((req, res) => controller.remove(req, res)));

  return r;
}