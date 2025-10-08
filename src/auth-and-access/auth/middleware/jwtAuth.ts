import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthUser } from '../types/AuthUser';

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.slice(7);

  try {
    const payload = AuthService.verifyAccessToken(token);

    const user: AuthUser = {
      id: Number(payload.sub),
      roles: payload.roles ?? ['user'],
      type: payload.type,
    };

    (req as any).user = user;

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
