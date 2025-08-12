import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;

  beforeEach(() => {
    guard = new LocalAuthGuard();
  });

  it('should call super.canActivate and return its value', () => {
    const context = {} as ExecutionContext;
    const superCanActivateSpy = jest.spyOn(LocalAuthGuard.prototype, 'canActivate');

    jest.spyOn(guard, 'canActivate').mockImplementation(() => true);

    const result = guard.canActivate(context);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });

  describe('handleRequest', () => {
    it('should throw UnauthorizedException if err is present', () => {
      const err = new Error('Erro de autenticação');

      expect(() => guard.handleRequest(err, null)).toThrowError(UnauthorizedException);
      expect(() => guard.handleRequest(err, null)).toThrow(err.message);
    });

    it('should throw UnauthorizedException if user is null or undefined', () => {
      expect(() => guard.handleRequest(null, null)).toThrowError(UnauthorizedException);
      expect(() => guard.handleRequest(null, undefined)).toThrowError(UnauthorizedException);
    });

    it('should return the user if no error and user is valid', () => {
      const user = { id: 1, username: 'teste' };
      const result = guard.handleRequest(null, user);
      expect(result).toBe(user);
    });
  });
});
