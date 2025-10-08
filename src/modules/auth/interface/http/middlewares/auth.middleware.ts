import { NextFunction, Request, Response } from 'express';
import { JwtTokenProvider } from '../../../infrastructure/token/jwt.provider';

const tokens = new JwtTokenProvider();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.substring('Bearer '.length).trim();

  try {
    const payload = tokens.verifyAccessToken<any>(token);
    (req as any).userId = Number(payload.sub);
    (req as any).userType = payload.type;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
