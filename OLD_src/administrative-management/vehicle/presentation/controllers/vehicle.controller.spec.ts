import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from '../../domain/services/vehicle.service';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { UserFromJwt } from '../../../../auth-and-access/auth/domain/models/UserFromJwt';

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: jest.Mocked<VehicleService>;

  const mockUser: UserFromJwt = {
    id: 999,
    email: 'testuser@example.com',
    name: 'Test User',
    roles: ['admin']
  };

  const mockVehicle: Vehicle = {
    id: 1,
    idPlate: 'ABC1234',
    brand: 'Toyota',
    color: 'White',
    type: 'SUV',
    model: 'Corolla',
    modelYear: 2020,
    manufactureYear: 2019,
    ownerId: 100,
    owner: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
    service = module.get(VehicleService) as jest.Mocked<VehicleService>;
  });

  describe('create', () => {
    it('should call service.create and return VehicleResponseDto', async () => {
      const dto: CreateVehicleDto = {
        idPlate: 'ABC1234',
        brand: 'Toyota',
        color: 'White',
        type: 'SUV',
        model: 'Corolla',
        modelYear: 2020,
        manufactureYear: 2019,
        ownerId: 100,
      };
      service.create.mockResolvedValue(mockVehicle);

      const result = await controller.create(mockUser, dto);
      expect(service.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toMatchObject({ id: mockVehicle.id, brand: mockVehicle.brand });
    });
  });

  describe('findAll', () => {
    it('should return a list of vehicles', async () => {
      service.findAll.mockResolvedValue([mockVehicle]);

      const result = await controller.findAll(mockUser);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([
        {
          id: mockVehicle.id,
          idPlate: mockVehicle.idPlate,
          type: mockVehicle.type,
          model: mockVehicle.model,
          brand: mockVehicle.brand,
          manufactureYear: mockVehicle.manufactureYear,
          modelYear: mockVehicle.modelYear,
          color: mockVehicle.color,
          ownerId: mockVehicle.ownerId,
          deletedAt: mockVehicle.deletedAt,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return one vehicle', async () => {
      service.findById.mockResolvedValue(mockVehicle);

      const result = await controller.findOne(mockUser, 1);
      expect(service.findById).toHaveBeenCalledWith(1, mockUser);
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return vehicle', async () => {
      const updateDto: UpdateVehicleDto = { color: 'Black' };
      const updatedVehicle = { ...mockVehicle, ...updateDto };
      service.update.mockResolvedValue(updatedVehicle);

      const result = await controller.update(mockUser, 1, updateDto);
      expect(service.update).toHaveBeenCalledWith(mockUser, 1, updateDto);
      expect(result.color).toBe('Black');
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      service.remove.mockResolvedValue();

      await controller.remove(mockUser, 1);
      expect(service.remove).toHaveBeenCalledWith(mockUser, 1);
    });
  });
});
