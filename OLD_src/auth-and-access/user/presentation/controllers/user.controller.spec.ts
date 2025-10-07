import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../domain/services/user.service';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user and return UserResponseDto', async () => {
      const createDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
        type: 'user',
        cpf: '12345678900',
        phone: '999999999',
      };

      const mockUser: User = {
        id: 1,
        name: createDto.name,
        email: createDto.email,
        password: 'hashedpassword',
        type: createDto.type,
        active: true,
        creationDate: new Date(),
        cpf: createDto.cpf,
        cnpj: null,
        phone: createDto.phone,
        address: null,
        city: null,
        state: null,
        zipCode: null,
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createDto);

      expect(service.createUser).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        type: mockUser.type,
        active: mockUser.active,
        creationDate: mockUser.creationDate,
        cpf: mockUser.cpf,
        cnpj: mockUser.cnpj,
        phone: mockUser.phone,
        address: mockUser.address,
        city: mockUser.city,
        state: mockUser.state,
        zipCode: mockUser.zipCode,
      });
    });
  });

  describe('updateUser', () => {
    it('should update logged user and return UserResponseDto', async () => {
      const userFromToken: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
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
      };

      const updateDto: UpdateUserDto = {
        name: 'John Updated',
        phone: '888888888',
      };

      const updatedUser: User = {
        ...userFromToken,
        ...updateDto,
      };

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(userFromToken, updateDto);

      expect(service.updateUser).toHaveBeenCalledWith(userFromToken.id, updateDto);
      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        type: updatedUser.type,
        active: updatedUser.active,
        creationDate: updatedUser.creationDate,
        cpf: updatedUser.cpf,
        cnpj: updatedUser.cnpj,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        zipCode: updatedUser.zipCode,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete logged user', async () => {
      const userFromToken: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
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
      };

      mockUserService.deleteUser.mockResolvedValue(undefined);

      await expect(controller.deleteUser(userFromToken)).resolves.toBeUndefined();

      expect(service.deleteUser).toHaveBeenCalledWith(userFromToken.id);
    });
  });
});
