import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload {
  sub: number; // user id
  email: string;
  type: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const p = decoded as JwtPayload;
    if (typeof p.sub !== 'number' || typeof p.email !== 'string' || typeof p.type !== 'string') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    (req as any).user = { sub: p.sub as number, email: p.email as string, type: p.type as string } as AuthPayload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
