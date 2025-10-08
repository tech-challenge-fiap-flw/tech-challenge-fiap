import { Router, Request, Response, NextFunction } from 'express';
import { ServiceOrderMySqlRepository } from '../infra/ServiceOrderMySqlRepository';
import { ServiceOrderService } from '../application/ServiceOrderService';
import { ServiceOrderEntity } from '../domain/ServiceOrder';
import { ServiceOrderHistoryMongoRepository } from '../../service-order-history/infra/ServiceOrderHistoryMongoRepository';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';
import { getPagination, toPage } from '../../../shared/http/pagination';

const repo = new ServiceOrderMySqlRepository();
const historyRepo = new ServiceOrderHistoryMongoRepository();
const service = new ServiceOrderService(repo, historyRepo);

export const serviceOrderRouter = Router();

serviceOrderRouter.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = ServiceOrderEntity.create(req.body);
    const created = await repo.create(entity);
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});

serviceOrderRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const found = await repo.findById(id);
    if (!found) return res.status(404).json({ error: 'Service order not found' });
    res.json(found.toJSON());
  } catch (err) { next(err); }
});

serviceOrderRouter.post('/:id/status', authMiddleware, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const userId = (req as any).user.sub as number;
    const updated = await service.changeStatus(id, status, userId);
    res.json(updated);
  } catch (err) { next(err); }
});

serviceOrderRouter.post('/:id/assign/:mechanicId', authMiddleware, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const mechanicId = Number(req.params.mechanicId);
    const updated = await service.assignMechanic(id, mechanicId);
    res.json(updated);
  } catch (err) { next(err); }
});

serviceOrderRouter.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await service.delete(id);
    res.status(204).send();
  } catch (err) { next(err); }
});

// Admin list service orders
serviceOrderRouter.get('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
