jest.mock('passport-jwt', () => {
  class MockStrategy {
    name: string;
    constructor(..._args: any[]) {
      this.name = 'jwt';
    }
  }
  return {
    Strategy: MockStrategy,
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: jest.fn(),
    },
  };
});

import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../../user/domain/services/user.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userService: UserService;

  beforeEach(() => {
    userService = {
      findByEmail: jest.fn(),
    } as unknown as UserService;

    strategy = new JwtStrategy(userService);
  });

  describe('validate', () => {
    const payload = {
      sub: 123,
      email: 'user@example.com',
      name: 'User Test',
    };

    it('should return UserFromJwt if user exists and is active', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        email: payload.email,
        active: true,
        type: 'admin',
      });

      const result = await strategy.validate(payload);

      expect(userService.findByEmail).toHaveBeenCalledWith(payload.email);
      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: ['admin'],
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Inactive user or user not found');
    });

    it('should throw UnauthorizedException if user exists but is not active', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        email: payload.email,
        active: false,
        type: 'admin',
      });

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Inactive user or user not found');
    });
  });
});
