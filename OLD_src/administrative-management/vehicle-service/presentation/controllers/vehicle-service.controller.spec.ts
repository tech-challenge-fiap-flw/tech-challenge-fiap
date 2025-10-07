import { Test, TestingModule } from '@nestjs/testing';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from '../../domain/services/vehicle-service.service';
import { NotFoundException } from '@nestjs/common';

describe('VehicleServiceController', () => {
  let controller: VehicleServiceController;
  let service: VehicleServiceService;

  const mockServiceResponse = {
    id: 1,
    name: 'Troca de óleo',
    description: 'Troca de óleo sintético',
    price: 100,
  };

  const vehicleServiceEntity = {
    id: 1,
    name: 'Troca de óleo',
    description: 'Troca de óleo sintético',
    price: 100,
    deletedAt: null,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(vehicleServiceEntity),
    findAll: jest.fn().mockResolvedValue([vehicleServiceEntity]),
    findOne: jest.fn().mockResolvedValue(vehicleServiceEntity),
    update: jest.fn().mockResolvedValue({
      ...vehicleServiceEntity,
      name: 'Novo nome',
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleServiceController],
      providers: [
        {
          provide: VehicleServiceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<VehicleServiceController>(VehicleServiceController);
    service = module.get<VehicleServiceService>(VehicleServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a vehicle service and return DTO', async () => {
      const dto = { name: 'Troca de óleo', price: 100, description: 'Troca de óleo sintético' };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('findAll', () => {
    it('should return array of vehicle services DTOs', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockServiceResponse]);
    });
  });

  describe('findOne', () => {
    it('should return vehicle service DTO by id', async () => {
      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockServiceResponse);
    });

    it('should throw NotFoundException when service not found', async () => {
      service.findOne = jest.fn().mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update vehicle service and return DTO', async () => {
      const updateDto = { name: 'Novo nome', description: 'Nova descrição' };

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({
        id: 1,
        name: 'Novo nome',
        description: vehicleServiceEntity.description,
        price: vehicleServiceEntity.price,
      });
    });
  });

  describe('remove', () => {
    it('should call service remove method', async () => {
      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
