import { Request, Response, NextFunction } from 'express';

export function rolesGuard(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { roles?: string[] } | undefined;

    if (!user || !user.roles) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!required.some(r => user.roles!.includes(r))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
