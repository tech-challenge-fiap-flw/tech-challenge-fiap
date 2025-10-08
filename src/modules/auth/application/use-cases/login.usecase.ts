import { UserRepositoryPort } from '../../../users/domain/repositories/user.repository.port';
import { PasswordService } from '../../../../shared/security/password.service';
import { TokenProviderPort } from '../../domain/ports/token-provider.port';
import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';

type Input = { email: string; password: string; };
type Output = { accessToken: string; refreshToken: string; };

export class LoginUseCase {
  constructor(
    private users: UserRepositoryPort,
    private tokens: TokenProviderPort,
    private authRepo: AuthRepositoryPort,
    private accessTtl = process.env.JWT_EXPIRES_IN || '15m',
    private refreshTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || '7')
  ) {}

  async execute({ email, password }: Input): Promise<Output> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.active) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const ok = await PasswordService.compare(password, user.password);
    if (!ok) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const accessToken = this.tokens.signAccessToken({ sub: user.id, type: user.type }, this.accessTtl);
    const refreshToken = this.tokens.signRefreshToken({ sub: user.id }, this.refreshTtlDays);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTtlDays);
    await this.authRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}
