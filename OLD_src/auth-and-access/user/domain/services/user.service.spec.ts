import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const dto = {
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
        type: 'admin',
        cpf: '12345678900',
        phone: '999999999',
      };

      repo.findOne.mockResolvedValue(null);
      const hashedPassword = 'hashedPassword123';

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      repo.create.mockImplementation((data) => data as any);
      repo.save.mockImplementation(async (user) => ({
        id: 1,
        ...user,
      } as any));

      const result = await service.createUser(dto as any);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 'salt');
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        password: hashedPassword,
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result.password).toBe(hashedPassword);
    });

    it('should throw BadRequestException if email already exists', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: '123',
          name: 'User',
          type: 'admin',
          cpf: '123',
          phone: '123',
        } as any),
      ).rejects.toThrow(BadRequestException);

      expect(repo.findOne).toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const user = { id: 1, email: 'a@b.com' } as User;
      repo.findOneBy.mockResolvedValue(user);

      const result = await service.findById(1);
      expect(result).toEqual(user);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if user not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      const userId = 1;
      const updateDto = { name: 'Updated Name' };

      repo.update.mockResolvedValue(undefined);
      const updatedUser = { id: userId, name: 'Updated Name' } as User;
      repo.findOne.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateDto);
      expect(repo.update).toHaveBeenCalledWith({ id: userId }, updateDto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user by setting active to false', async () => {
      const userId = 1;
      repo.update.mockResolvedValue(undefined);

      await service.deleteUser(userId);

      expect(repo.update).toHaveBeenCalledWith({ id: userId }, { active: false });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      repo.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(user);
    });
  });
});
