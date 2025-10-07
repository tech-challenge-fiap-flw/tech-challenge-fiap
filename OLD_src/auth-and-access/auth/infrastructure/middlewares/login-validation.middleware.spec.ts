import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { LoginValidationMiddleware } from './login-validation.middleware';

jest.mock('../../domain/models/LoginRequestBody', () => {
  return {
    LoginRequestBody: class {
      email?: string;
      password?: string;
    },
  };
});

jest.mock('class-validator', () => {
  const actual = jest.requireActual('class-validator');
  return {
    ...actual,
    validate: jest.fn(),
  };
});

describe('LoginValidationMiddleware', () => {
  let middleware: LoginValidationMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new LoginValidationMiddleware();
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  it('should call next if validation passes', async () => {
    (validate as jest.Mock).mockResolvedValue([]);

    req.body = {
      email: 'test@example.com',
      password: '123456',
    };

    await middleware.use(req as Request, res as Response, next);

    expect(validate).toHaveBeenCalledWith(expect.any(Object));
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException if validation fails', async () => {
    const mockValidationErrors = [
      {
        constraints: {
          isEmail: 'email must be an email',
          isNotEmpty: 'email should not be empty',
        },
      },
      {
        constraints: {
          minLength: 'password must be longer than or equal to 6 characters',
        },
      },
    ];

    (validate as jest.Mock).mockResolvedValue(mockValidationErrors);

    req.body = {
      email: 'invalid-email',
      password: '123',
    };

    await expect(
      middleware.use(req as Request, res as Response, next),
    ).rejects.toThrow(BadRequestException);

    await middleware.use(req as Request, res as Response, next).catch((e) => {
      expect(e).toBeInstanceOf(BadRequestException);
      const response: any = e.getResponse();
      expect(response.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'password must be longer than or equal to 6 characters',
      ]);
    });

    expect(next).not.toHaveBeenCalled();
  });
});
