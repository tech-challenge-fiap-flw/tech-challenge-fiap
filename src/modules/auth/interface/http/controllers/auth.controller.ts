import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/login.usecase';
import { RefreshUseCase } from '../../../application/use-cases/refresh.usecase';
import { LogoutUseCase } from '../../../application/use-cases/logout.usecase';
import { PrismaUserRepository } from '../../../../users/infrastructure/persistence/prisma/user.repository.adapter';
import { PrismaAuthRepository } from '../../../infrastructure/persistence/prisma/auth.repository.adapter';
import { JwtTokenProvider } from '../../../infrastructure/token/jwt.provider';

const usersRepo = new PrismaUserRepository();
const authRepo = new PrismaAuthRepository();
const tokens = new JwtTokenProvider();

export class AuthController {
  static async login(req: Request, res: Response) {
    const uc = new LoginUseCase(usersRepo, tokens, authRepo);
    const result = await uc.execute(req.body);
    return res.status(200).json(result);
  }

  static async refresh(req: Request, res: Response) {
    const uc = new RefreshUseCase(tokens, authRepo);
    const result = await uc.execute(req.body);
    return res.status(200).json(result);
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken: string };
    const uc = new LogoutUseCase(authRepo);
    await uc.execute(refreshToken);
    return res.status(204).send();
  }
}
