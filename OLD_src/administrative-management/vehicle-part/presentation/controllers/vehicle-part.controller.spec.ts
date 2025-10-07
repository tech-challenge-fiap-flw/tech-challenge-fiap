import { Test, TestingModule } from '@nestjs/testing';
import { VehiclePartController } from './vehicle-part.controller';
import { VehiclePartService } from '../../domain/services/vehicle-part.service';
import { VehiclePart } from '../../domain/entities/vehicle-part.entity';
import { CreateVehiclePartDto } from '../dto/create-vehicle-part.dto';

describe('VehiclePartController', () => {
  let controller: VehiclePartController;
  let service: jest.Mocked<VehiclePartService>;

  const mockPart: VehiclePart = {
    id: 1,
    type: 'Motor',
    name: 'Correia Dentada',
    description: 'Correia de borracha',
    quantity: 15,
    deletedAt: null,
    creationDate: new Date(),
    price: 0
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclePartController],
      providers: [
        {
          provide: VehiclePartService,
          useValue: {
            create: jest.fn(),
            findByNameLike: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VehiclePartController>(VehiclePartController);
    service = module.get(VehiclePartService);
  });

  describe('create', () => {
    it('should call service.create and return VehiclePartResponseDto', async () => {
      const dto: CreateVehiclePartDto = {
        type: mockPart.type,
        name: mockPart.name,
        description: mockPart.description,
        quantity: mockPart.quantity,
        price: 0
      };
      service.create.mockResolvedValue(mockPart);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: mockPart.id,
        type: mockPart.type,
        name: mockPart.name,
        description: mockPart.description,
        quantity: mockPart.quantity,
        deletedAt: mockPart.deletedAt,
        price: mockPart.price,
      });
    });
  });

  describe('findByNameLike', () => {
    it('should return a list of parts by name', async () => {
      service.findByNameLike.mockResolvedValue([mockPart]);

      const result = await controller.findByNameLike('correia');

      expect(service.findByNameLike).toHaveBeenCalledWith('correia');
      expect(result).toEqual([
        {
          id: mockPart.id,
          type: mockPart.type,
          name: mockPart.name,
          description: mockPart.description,
          quantity: mockPart.quantity,
          deletedAt: mockPart.deletedAt,
          price: mockPart.price,
        },
      ]);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      service.remove.mockResolvedValue();

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
