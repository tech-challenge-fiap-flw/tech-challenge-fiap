import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  });

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Usuário não autenticado');
  });

  it('should throw ForbiddenException if user does not have required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager']);

    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({
      user: {
        roles: ['user'],
      },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Usuário não tem permissão');
  });

  it('should allow access if user has at least one required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager']);

    (context.switchToHttp().getRequest as jest.Mock).mockReturnValue({
      user: {
        roles: ['manager', 'user'],
      },
    });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
