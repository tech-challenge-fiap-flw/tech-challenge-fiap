jest.mock('passport-local', () => {
  class MockStrategy {
    name: string;
    constructor(_options: any) {
      this.name = 'local';
    }
  }
  return {
    Strategy: MockStrategy,
  };
});

import { LocalStrategy } from './local.strategy';
import { AuthService } from '../../domain/services/auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      authenticateUser: jest.fn(),
    } as unknown as AuthService;

    strategy = new LocalStrategy(authService);
  });

  describe('validate', () => {
    const email = 'user@example.com';
    const password = 'password123';

    it('should call authService.authenticateUser with email and password and return user', async () => {
      const user = { id: 1, email };
      (authService.authenticateUser as jest.Mock).mockResolvedValue(user);

      const result = await strategy.validate(email, password);

      expect(authService.authenticateUser).toHaveBeenCalledWith(email, password);
      expect(result).toBe(user);
    });

    it('should propagate errors from authService.authenticateUser', async () => {
      const error = new Error('Invalid credentials');
      (authService.authenticateUser as jest.Mock).mockRejectedValue(error);

      await expect(strategy.validate(email, password)).rejects.toThrow(error);
    });
  });
});
