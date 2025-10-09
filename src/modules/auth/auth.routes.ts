import { Router } from 'express';
import { adaptExpress } from '../../shared/http/Controller';
import { UserMySqlRepository } from '../user/infra/UserMySqlRepository';
import { LoginController } from './controllers/LoginController';
import { UserService } from '../user/application/UserService';

const repo = new UserMySqlRepository();
const service = new UserService(repo);

export const authRouter = Router();

authRouter.post('/login', adaptExpress(new LoginController(service)));
