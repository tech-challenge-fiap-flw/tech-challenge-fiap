import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should return user without password if credentials are correct and active', async () => {
      const email = 'test@example.com';
      const password = 'correctpassword';

      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email,
        password: 'hashedpassword',
        active: true,
        type: 'user',
        creationDate: new Date(),
        cpf: '12345678900',
        cnpj: null,
        phone: '999999999',
        address: null,
        city: null,
        state: null,
        zipCode: null,
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.authenticateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result.password).toBeUndefined();
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        active: true,
      });
    });

    it('should throw error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const mockUser = { password: 'hashedpassword', active: true } as User;
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.authenticateUser(email, password)).rejects.toThrow(
        'Password provided is incorrect.'
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should throw error if user not found or inactive', async () => {
      const email = 'notfound@example.com';
      const password = 'any';

      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.authenticateUser(email, password)).rejects.toThrow(
        `The e-mail '${email}' is not registered or is inactive.`
      );

      // Also test inactive user
      const inactiveUser = { active: false } as User;
      (userService.findByEmail as jest.Mock).mockResolvedValue(inactiveUser);

      await expect(service.authenticateUser(email, password)).rejects.toThrow(
        `The e-mail '${email}' is not registered or is inactive.`
      );
    });
  });

  describe('retrieveJwt', () => {
    it('should return JWT token signed with correct payload', () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        active: true,
        type: 'user',
        creationDate: new Date(),
        cpf: '12345678900',
        cnpj: null,
        phone: '999999999',
        address: null,
        city: null,
        state: null,
        zipCode: null,
      };

      const token = 'signed.jwt.token';
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = service.retrieveJwt(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        name: user.name,
      });
      expect(result).toEqual({ access_token: token });
    });
  });
});
