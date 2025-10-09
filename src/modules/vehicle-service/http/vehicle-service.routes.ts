import { Router, Request, Response, NextFunction } from 'express';
import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../domain/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new VehicleServiceMySqlRepository();
export const vehicleServiceRouter = Router();

vehicleServiceRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = VehicleServiceEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});

vehicleServiceRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    if (!found) return res.status(404).json({ error: 'Vehicle service not found' });
    res.json(found.toJSON());
  } catch (err) { next(err); }
});

vehicleServiceRouter.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await repo.update(id, req.body);
    res.json(updated.toJSON());
  } catch (err) { next(err); }
});

vehicleServiceRouter.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await repo.softDelete(id);
    res.status(204).send();
  } catch (err) { next(err); }
});

vehicleServiceRouter.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
