export interface AuthRepositoryPort {
  saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: number): Promise<void>;
  isRefreshTokenActive(token: string): Promise<boolean>;
}
