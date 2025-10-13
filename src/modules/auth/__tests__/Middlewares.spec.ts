import { authMiddleware } from '../AuthMiddleware';
import { requireRole } from '../RoleMiddleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeNext = () => jest.fn();

describe('authMiddleware', () => {
  const secret = 'test-secret';
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: secret };
  });
  afterAll(() => { process.env = OLD_ENV; });

  it('retorna 401 sem header', () => {
    const req: any = { header: () => '' };
    const res = makeRes();
    const next = makeNext();

    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 se token inválido', () => {
    const req: any = { header: () => 'Bearer token' };
    const res = makeRes();
    const next = makeNext();
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('bad'); });

    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna 401 se payload inválido', () => {
    const req: any = { header: () => 'Bearer token' };
    const res = makeRes();
    const next = makeNext();
    (jwt.verify as jest.Mock).mockReturnValue({ something: 'wrong' });

    authMiddleware(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('segue em frente com payload válido', () => {
    const req: any = { header: () => 'Bearer token' };
    const res = makeRes();
    const next = makeNext();
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 1, email: 'a@a.com', type: 'ADMIN' });

    authMiddleware(req, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ sub: 1, email: 'a@a.com', type: 'ADMIN' });
  });
});

describe('requireRole', () => {
  it('retorna 403 sem user', () => {
    const req: any = {};
    const res = makeRes();
    const next = makeNext();
    requireRole('ADMIN')(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retorna 403 com role incorreta', () => {
    const req: any = { user: { type: 'CLIENT' } };
    const res = makeRes();
    const next = makeNext();
    requireRole('ADMIN')(req, res as any, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('chama next com role correta', () => {
    const req: any = { user: { type: 'ADMIN' } };
    const res = makeRes();
    const next = makeNext();
    requireRole('ADMIN')(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });
});
