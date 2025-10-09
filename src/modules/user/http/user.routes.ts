import { Router, Request, Response, NextFunction } from 'express';
import { UserMySqlRepository } from '../infra/UserMySqlRepository';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { UserService } from '../application/UserService';
import { getPagination, toPage } from '../../../shared/http/pagination';
import { requireRole } from '../../auth/RoleMiddleware';

const repo = new UserMySqlRepository();
const service = new UserService(repo);

interface AuthRequest extends Request {
  user?: {
    sub: number;
    type: string;
  };
}

const createUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.createUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const updateCurrentUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as AuthRequest).user?.sub as number;
    const result = await service.updateUser(id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteCurrentUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as AuthRequest).user?.sub as number;
    await service.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getCurrentUserProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req as AuthRequest).user?.sub as number;
    const user = await repo.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...rest } = user.toJSON(); 
    res.json(rest);
  } catch (err) {
    next(err);
  }
};

const getUserByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paramId = Number(req.params.id);
    const current = (req as AuthRequest).user;

    if (current?.type !== 'admin' && current?.sub !== paramId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await repo.findById(paramId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...rest } = user.toJSON();
    res.json(rest);
  } catch (err) {
    next(err);
  }
};

const listUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req);
    
    const [items, total] = await Promise.all([
      repo.list(offset, limit),
      repo.countAll(),
    ]);
    
    res.json(toPage(items.map(i => i.toJSON()), page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const userRouter = Router();

userRouter.post('/', createUserHandler);
userRouter.put('/', authMiddleware, updateCurrentUserHandler);
userRouter.delete('/', authMiddleware, deleteCurrentUserHandler);
userRouter.get('/me', authMiddleware, getCurrentUserProfileHandler);
userRouter.get('/:id', authMiddleware, getUserByIdHandler);
userRouter.get('/', authMiddleware, requireRole('admin'), listUsersHandler);