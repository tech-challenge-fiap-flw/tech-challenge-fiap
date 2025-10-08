import { prisma } from '../../../../../shared/prisma/client';
import { AuthRepositoryPort } from '../../../domain/ports/auth.repository.port';

export class PrismaAuthRepository implements AuthRepositoryPort {
  async saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: { userId, token, expiresAt }
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async isRefreshTokenActive(token: string): Promise<boolean> {
    const rt = await prisma.refreshToken.findUnique({ where: { token } });
    if (!rt) return false;
    if (rt.revokedAt) return false;
    if (rt.expiresAt.getTime() <= Date.now()) return false;
    return true;
    }
}
