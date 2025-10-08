export interface TokenProviderPort {
  signAccessToken(payload: object, expiresIn?: string): string;
  signRefreshToken(payload: object, expiresInDays?: number): string;
  verifyAccessToken<T = any>(token: string): T;
  verifyRefreshToken<T = any>(token: string): T;
}
