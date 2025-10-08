import { TokenProviderPort } from '../../domain/ports/token-provider.port';
import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';

type Input = { refreshToken: string; };
type Output = { accessToken: string; refreshToken: string; };

export class RefreshUseCase {
  constructor(
    private tokens: TokenProviderPort,
    private authRepo: AuthRepositoryPort,
    private accessTtl = process.env.JWT_EXPIRES_IN || '15m',
    private refreshTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || '7')
  ) {}

  async execute({ refreshToken }: Input): Promise<Output> {
    const payload = this.tokens.verifyRefreshToken<any>(refreshToken);
    const active = await this.authRepo.isRefreshTokenActive(refreshToken);

    if (!active) {
      const err: any = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    }

    const userId = Number(payload.sub);
    const accessToken = this.tokens.signAccessToken({ sub: userId }, this.accessTtl);
    const newRefreshToken = this.tokens.signRefreshToken({ sub: userId }, this.refreshTtlDays);

    await this.authRepo.revokeRefreshToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTtlDays);
    await this.authRepo.saveRefreshToken(userId, newRefreshToken, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
