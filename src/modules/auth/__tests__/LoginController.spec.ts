import { LoginController } from '../controllers/LoginController';
import { userServiceMock, makeUser } from './mocks';
import { HttpError } from '../../../shared/http/HttpError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const makeRequest = (body: any) => ({ body } as any);

describe('LoginController', () => {
  const secret = 'test-secret';
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: secret };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('retorna token em login válido', async () => {
    const service = userServiceMock();
    const user = makeUser({ password: 'hashed' });
    service.findByEmail.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

    const controller = new LoginController(service);
    const res = await controller.handle(makeRequest({ email: user.toJSON().email, password: 'plain' }));

    expect(res.status).toBe(200);
    expect(res.body?.token).toBe('jwt-token');
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: user.toJSON().id }),
      secret,
      expect.any(Object)
    );
  });

  it('lança unauthorized se email não existe', async () => {
    const service = userServiceMock();
    service.findByEmail.mockRejectedValue(new HttpError(401, 'Invalid credentials'));
    const controller = new LoginController(service);

    await expect(() => controller.handle(makeRequest({ email: 'x@x.com', password: 'a' })))
      .rejects.toMatchObject({ status: 401 });
  });

  it('lança unauthorized se senha incorreta', async () => {
    const service = userServiceMock();
    const user = makeUser({ password: 'hashed' });
    service.findByEmail.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const controller = new LoginController(service);

    await expect(() => controller.handle(makeRequest({ email: user.toJSON().email, password: 'wrong' })))
      .rejects.toMatchObject({ status: 401 });
  });

  it('lança badRequest em payload inválido', async () => {
    const service = userServiceMock();
    const controller = new LoginController(service);

    await expect(() => controller.handle(makeRequest({ email: 'not-an-email', password: '' })))
      .rejects.toMatchObject({ status: 400 });
  });
});
