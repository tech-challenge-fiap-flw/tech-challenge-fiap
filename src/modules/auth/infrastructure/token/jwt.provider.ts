import jwt from 'jsonwebtoken';
import { TokenProviderPort } from '../../domain/ports/token-provider.port';
import * as ms from 'ms'; 

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export class JwtTokenProvider implements TokenProviderPort {
  signAccessToken(payload: object, expiresIn?: string): string {
    const expiration = (expiresIn || '15m') as ms.StringValue;
    return jwt.sign(payload, SECRET, { expiresIn: expiration });
  }

  signRefreshToken(payload: object, expiresInDays = 7): string {
    const seconds = 60 * 60 * 24 * expiresInDays;
    return jwt.sign(payload, SECRET, { expiresIn: seconds });
  }

  verifyAccessToken<T = any>(token: string): T {
    return jwt.verify(token, SECRET) as T;
  }

  verifyRefreshToken<T = any>(token: string): T {
    return jwt.verify(token, SECRET) as T;
  }
}
