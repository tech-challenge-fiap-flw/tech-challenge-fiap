import { Router, Request, Response, NextFunction } from 'express';
import { VehicleMySqlRepository } from '../infra/VehicleMySqlRepository';
import { VehicleService } from '../application/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';

const repo = new VehicleMySqlRepository();
const service = new VehicleService(repo);

export const vehicleRouter = Router();

vehicleRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.createVehicle(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

vehicleRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    if (!found) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(found.toJSON());
  } catch (err) { next(err); }
});

vehicleRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await service.updateVehicle(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

vehicleRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.deleteVehicle(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

vehicleRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
