import { Request, Response } from 'express';
import { LoginUseCase } from '../usecases/LoginUseCase';
import { RefreshTokenUseCase } from '../usecases/RefreshTokenUseCase';

export class AuthController {
  constructor(
    private loginUC: LoginUseCase,
    private refreshUC: RefreshTokenUseCase
  ) {}

  async login(req: Request, res: Response) {
    const result = await this.loginUC.execute(req.body);
    return res.json(result);
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body || {};
    const result = await this.refreshUC.execute(refreshToken);
    return res.json(result);
  }
}
