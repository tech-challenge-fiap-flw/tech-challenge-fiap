import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './auth-and-access/user/domain/entities/user.entity';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Authenticated: Test User"', () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        type: 'user',
        active: true,
        creationDate: new Date(),
        cpf: '12345678900',
        cnpj: null,
        phone: '999999999',
        address: null,
        city: null,
        state: null,
        zipCode: null,
      } as User;

      expect(appController.getHello(mockUser)).toBe('Authenticated: Test User');
    });
  });
});
