import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../domain/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            retrieveJwt: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should call authService.retrieveJwt with request.user and return token', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = { accessToken: 'jwt-token' };

      (authService.retrieveJwt as jest.Mock).mockResolvedValue(mockToken);

      const result = await controller.login({ user: mockUser } as any);

      expect(authService.retrieveJwt).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockToken);
    });
  });
});
