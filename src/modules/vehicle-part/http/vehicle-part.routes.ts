import { Router, Request, Response, NextFunction } from 'express';
import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import { VehiclePartEntity } from '../domain/VehiclePart';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { authMiddleware } from '../../auth/AuthMiddleware';

const repo = new VehiclePartMySqlRepository();
export const vehiclePartRouter = Router();

vehiclePartRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = VehiclePartEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});

vehiclePartRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    if (!found) return res.status(404).json({ error: 'Vehicle part not found' });
    res.json(found.toJSON());
  } catch (err) { next(err); }
});

vehiclePartRouter.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await repo.update(id, req.body);
    res.json(updated.toJSON());
  } catch (err) { next(err); }
});

vehiclePartRouter.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await repo.softDelete(id);
    res.status(204).send();
  } catch (err) { next(err); }
});

vehiclePartRouter.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
