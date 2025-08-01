import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { NotFoundException } from '@nestjs/common';

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
    it('should create a vehicle when user exists', async () => {
      const dto = { ownerId: 1, plate: 'ABC1234' } as any;
      userService.findById.mockResolvedValue({ id: 1 });
      vehicleRepo.save.mockResolvedValue({ id: 10, ...dto });

      const result = await service.create(dto);
      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(vehicleRepo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 10, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      const vehicles = [{ id: 1 }, { id: 2 }] as Vehicle[];
      vehicleRepo.find.mockResolvedValue(vehicles);

      const result = await service.findAll();
      expect(vehicleRepo.find).toHaveBeenCalledWith({ loadEagerRelations: false });
      expect(result).toEqual(vehicles);
    });
  });

  describe('findById', () => {
    it('should return a vehicle when found', async () => {
      const vehicle = { id: 1 } as Vehicle;
      vehicleRepo.findOne.mockResolvedValue(vehicle);

      const result = await service.findById(1);
      expect(vehicleRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, loadEagerRelations: false });
      expect(result).toEqual(vehicle);
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      vehicleRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const existing = {
        id: 1,
        idPlate: 'ABC1234',
        plate: 'ABC1234',
        brand: 'NO BRAND',
        color: 'White',
        type: 'Car',
        model: 'Car 1',
        modelYear: 2017,
        manufactureYear: 2016,
        ownerId: 1,
        owner: null,
        deletedAt: null
      } as Vehicle;

      const updateData = {
        idPlate: 'XYZ9876',
      };

      const updated = {
        ...existing,
        ...updateData,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(existing);
      vehicleRepo.save.mockResolvedValue(updated);

      const result = await service.update(1, updateData);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should soft remove a vehicle', async () => {
      const vehicle = { id: 1 } as Vehicle;
      jest.spyOn(service, 'findById').mockResolvedValue(vehicle);

      await service.remove(1);
      expect(vehicleRepo.softRemove).toHaveBeenCalledWith(vehicle);
    });
  });
});
