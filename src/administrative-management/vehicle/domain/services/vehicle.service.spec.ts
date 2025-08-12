import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { NotFoundException } from '@nestjs/common';
import { UserFromJwt } from '../../../../auth-and-access/auth/domain/models/UserFromJwt';

const mockVehicleRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softRemove: jest.fn(),
});

const mockUserService = () => ({
  findById: jest.fn(),
});

describe('VehicleService', () => {
  let service: VehicleService;
  let vehicleRepo: jest.Mocked<Repository<Vehicle>>;
  let userService: ReturnType<typeof mockUserService>;

  const adminUser: UserFromJwt = { id: 99, roles: ['admin'] } as any;
  const normalUser: UserFromJwt = { id: 50, roles: ['user'] } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: getRepositoryToken(Vehicle), useFactory: mockVehicleRepository },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
    vehicleRepo = module.get(getRepositoryToken(Vehicle));
    userService = module.get(UserService);
  });

  describe('create', () => {
    it('should create a vehicle when admin user exists', async () => {
      const dto = { ownerId: 1, plate: 'ABC1234' } as any;
      userService.findById.mockResolvedValue({ id: 1 });
      vehicleRepo.save.mockResolvedValue({ id: 10, ...dto });

      const result = await service.create(adminUser, dto);

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(vehicleRepo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 10, ...dto });
    });

    it('should set ownerId to logged user if not admin', async () => {
      const dto = { plate: 'XYZ9999' } as any;
      vehicleRepo.save.mockResolvedValue({ id: 20, ownerId: 50, plate: 'XYZ9999' } as any);

      const result = await service.create(normalUser, dto);

      expect(userService.findById).not.toHaveBeenCalled();
      expect(vehicleRepo.save).toHaveBeenCalledWith({ ...dto, ownerId: 50 });
      expect(result).toEqual({ id: 20, ownerId: 50, plate: 'XYZ9999' });
    });
  });

  describe('findAll', () => {
    it('should return all vehicles for admin', async () => {
      const vehicles = [{ id: 1 }, { id: 2 }] as Vehicle[];
      vehicleRepo.find.mockResolvedValue(vehicles);

      const result = await service.findAll(adminUser);

      expect(vehicleRepo.find).toHaveBeenCalledWith({
        where: {},
        loadEagerRelations: false,
      });
      expect(result).toEqual(vehicles);
    });

    it('should return only vehicles owned by non-admin user', async () => {
      const vehicles = [{ id: 3 }] as Vehicle[];
      vehicleRepo.find.mockResolvedValue(vehicles);

      const result = await service.findAll(normalUser);

      expect(vehicleRepo.find).toHaveBeenCalledWith({
        where: { ownerId: 50 },
        loadEagerRelations: false,
      });
      expect(result).toEqual(vehicles);
    });
  });

  describe('findById', () => {
    it('should return a vehicle for admin', async () => {
      const vehicle = { id: 1 } as Vehicle;
      vehicleRepo.findOne.mockResolvedValue(vehicle);

      const result = await service.findById(1, adminUser);
      expect(vehicleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        loadEagerRelations: false,
      });
      expect(result).toEqual(vehicle);
    });

    it('should return a vehicle for owner', async () => {
      const vehicle = { id: 2, ownerId: 50 } as Vehicle;
      vehicleRepo.findOne.mockResolvedValue(vehicle);

      const result = await service.findById(2, normalUser);
      expect(vehicleRepo.findOne).toHaveBeenCalledWith({
        where: { id: 2, ownerId: 50 },
        loadEagerRelations: false,
      });
      expect(result).toEqual(vehicle);
    });

    it('should throw NotFoundException if not found', async () => {
      vehicleRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(99, adminUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const existing = { id: 1, ownerId: 50, plate: 'OLD' } as unknown as Vehicle;
      const updateData = { plate: 'NEW' } as any;
      const updated = { ...existing, ...updateData };

      jest.spyOn(service, 'findById').mockResolvedValue(existing);
      vehicleRepo.save.mockResolvedValue(updated);

      const result = await service.update(normalUser, 1, updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should soft remove a vehicle', async () => {
      const vehicle = { id: 1 } as Vehicle;
      jest.spyOn(service, 'findById').mockResolvedValue(vehicle);

      await service.remove(adminUser, 1);
      expect(vehicleRepo.softRemove).toHaveBeenCalledWith(vehicle);
    });
  });
});
