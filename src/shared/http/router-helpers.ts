import { Router } from 'express';

export const asyncHandler = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);

export function createModuleRouter(authWall: any) {
  const pub = Router();
  const priv = Router();

  priv.use(authWall);

  const mount = Router();

  mount.use(pub);
  mount.use(priv);

  return { pub, priv, mount };
}
