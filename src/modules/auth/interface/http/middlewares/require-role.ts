import { NextFunction, Request, Response } from 'express';

export function requireRole(...allowed: string[]) {
  const allowedSet = new Set(allowed.map(r => r.toLowerCase()));

  return (req: Request, res: Response, next: NextFunction) => {
    const roles: string[] = (req as any).userRoles || [];
    const has = roles.some(r => allowedSet.has(r));

    if (!has) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}
