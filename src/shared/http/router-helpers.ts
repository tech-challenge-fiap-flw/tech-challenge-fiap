import { Router } from 'express';

export function createModuleRouter(authWall: any) {
  const pub = Router();
  const priv = Router();

  priv.use(authWall);

  const mount = Router();

  mount.use(pub);
  mount.use(priv);

  return { pub, priv, mount };
}
