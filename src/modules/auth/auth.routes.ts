import { Router } from 'express';
import { adaptExpress } from '../../shared/http/Controller';
import { LoginController } from './AuthController';
import { UserMySqlRepository } from '../user/infra/UserMySqlRepository';

const repo = new UserMySqlRepository();
export const authRouter = Router();

authRouter.post('/login', adaptExpress(new LoginController(repo)));
