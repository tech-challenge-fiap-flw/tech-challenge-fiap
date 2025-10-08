import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
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
  static async login(req: HttpRequest<{ email: string; password: string }>): Promise<HttpResponse> {
    const uc = new LoginUseCase(usersRepo, tokens, authRepo);
    const result = await uc.execute(req.body);
    return { status: 200, body: result };
  }

  static async refresh(req: HttpRequest<{ refreshToken: string }>): Promise<HttpResponse> {
    const uc = new RefreshUseCase(tokens, authRepo);
    const result = await uc.execute(req.body);
    return { status: 200, body: result };
  }

  static async logout(req: HttpRequest<{ refreshToken: string }>): Promise<HttpResponse> {
    const { refreshToken } = req.body;
    const uc = new LogoutUseCase(authRepo);
    await uc.execute(refreshToken);
    return { status: 204 };
  }
}
