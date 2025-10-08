import { Router, Request, Response, NextFunction } from 'express';
import { UserMySqlRepository } from '../infra/UserMySqlRepository';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { UserService } from '../application/UserService';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { requireRole } from '../../auth/RoleMiddleware';

const repo = new UserMySqlRepository();
const service = new UserService(repo);

export const userRouter = Router();

// Create User (public for now)
userRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.createUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Update current user (expects x-user-id header for now; replace with auth later)
userRouter.put('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as any).user?.sub as number;
    const result = await service.updateUser(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// Soft-delete current user
userRouter.delete('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as any).user?.sub as number;
    await service.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Get current user profile
userRouter.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as any).user?.sub as number;
    const user = await repo.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...rest } = user.toJSON() as any;
    res.json(rest);
  } catch (err) { next(err); }
});

// Get user by id (only self or admin)
userRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paramId = Number(req.params.id);
    const current = (req as any).user;
    if (current.type !== 'admin' && current.sub !== paramId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await repo.findById(paramId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...rest } = user.toJSON() as any;
    res.json(rest);
  } catch (err) { next(err); }
});

// List users (admin only)
userRouter.get('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) { next(err); }
});
