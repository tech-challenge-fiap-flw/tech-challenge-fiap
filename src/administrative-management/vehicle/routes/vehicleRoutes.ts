import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';

export function makeVehicleRouter(controller: VehicleController) {
  const router = Router();

  // base: /administrative-management/vehicle
  router.post('/', (req, res) => controller.create(req, res));
  router.get('/', (req, res) => controller.list(req, res));
  router.get('/:id', (req, res) => controller.get(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.remove(req, res));

  return router;
}
