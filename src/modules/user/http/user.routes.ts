import { Router } from 'express';
import { UserMySqlRepository } from '../infra/UserMySqlRepository';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';
import { UserService } from '../application/UserService';
import { adaptExpress } from '../../../shared/http/Controller';
import { 
  CreateUserController,
  UpdateCurrentUserController,
  DeleteCurrentUserController,
  GetUserProfileController,
  GetUserByIdController,
  ListUsersController,
} from './UserController';

const repo = new UserMySqlRepository();
const service = new UserService(repo);

export const userRouter = Router();

userRouter.post('/', adaptExpress(new CreateUserController(service)));
userRouter.put('/', authMiddleware, adaptExpress(new UpdateCurrentUserController(service)));
userRouter.delete('/', authMiddleware, adaptExpress(new DeleteCurrentUserController(service)));
userRouter.get('/me', authMiddleware, adaptExpress(new GetUserProfileController(repo)));
userRouter.get('/:id', authMiddleware, adaptExpress(new GetUserByIdController(repo)));
userRouter.get('/', authMiddleware, requireRole('admin'), adaptExpress(new ListUsersController(repo)));