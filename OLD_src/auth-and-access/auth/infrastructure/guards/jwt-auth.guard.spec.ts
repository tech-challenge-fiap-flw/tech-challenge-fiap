import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedError } from '../../presentation/errors/unauthorized.error';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);

    jest.spyOn(guard, 'canActivate').mockImplementation(function (context: ExecutionContext) {
      return true;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return true if route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should call super.canActivate and return boolean if not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockRestore();
    jest.spyOn(guard, 'canActivate').mockReturnValue(true);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should call super.canActivate and return the Promise result if not public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockRestore();

    const canActivatePromise = Promise.resolve(true);
    jest.spyOn(guard, 'canActivate').mockImplementation(() => canActivatePromise);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException with message when UnauthorizedError is thrown', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockRestore();

    const errorMessage = 'Token inválido';
    const error = new UnauthorizedError(errorMessage);

    jest.spyOn(guard, 'canActivate').mockImplementation(() => Promise.reject(error));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(errorMessage),
    );
  });

  it('should throw generic UnauthorizedException when other error is thrown', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockRestore();

    const error = new UnauthorizedException('Algum erro inesperado');

    jest.spyOn(guard, 'canActivate').mockImplementation(() => Promise.reject(error));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
