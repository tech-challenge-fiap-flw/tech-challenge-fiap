import { Test, TestingModule } from '@nestjs/testing';
import { VehiclePartService } from './vehicle-part.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehiclePart } from '../entities/vehicle-part.entity';
import { EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  softRemove: jest.fn(),
});

describe('VehiclePartService', () => {
  let service: VehiclePartService;
  let repository: jest.Mocked<Repository<VehiclePart>>;

  const mockPart: VehiclePart = {
    id: 1,
    type: 'Motor',
    name: 'Correia',
    description: 'Correia dentada',
    quantity: 10,
    deletedAt: null,
    creationDate: new Date(),
    price: 0
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclePartService,
        {
          provide: getRepositoryToken(VehiclePart),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclePartService>(VehiclePartService);
    repository = module.get(getRepositoryToken(VehiclePart));
  });

  describe('create', () => {
    it('should create and return a vehicle part', async () => {
      repository.save.mockResolvedValue(mockPart);

      const result = await service.create({
        type: mockPart.type,
        name: mockPart.name,
        description: mockPart.description,
        quantity: mockPart.quantity,
        price: 0
      });

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPart);
    });
  });

  describe('findByNameLike', () => {
    it('should return parts with matching name', async () => {
      repository.find.mockResolvedValue([mockPart]);

      const result = await service.findByNameLike('correia');
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          name: expect.any(Object),
        },
      });
      expect(result).toEqual([mockPart]);
    });
  });

  describe('findOne', () => {
    it('should return the vehicle part if found', async () => {
      repository.findOneBy.mockResolvedValue(mockPart);

      const result = await service.findOne(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockPart);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIds', () => {
    it('should return multiple parts by IDs', async () => {
      repository.find.mockResolvedValue([mockPart]);

      const result = await service.findByIds([1, 2, 3]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          id: expect.any(Object),
        },
      });
      expect(result).toEqual([mockPart]);
    });
  });

  describe('remove', () => {
    it('should soft remove an existing part', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPart);
      repository.softRemove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.softRemove).toHaveBeenCalledWith(mockPart);
    });
  });

  describe('updatePart', () => {
    const updateDto = {
      name: 'Correia Nova',
      quantity: 20,
    };
  
    it('should update using vehiclePartRepository if no manager is passed', async () => {
      repository.update = jest.fn().mockResolvedValue(undefined);
      repository.findOne = jest.fn().mockResolvedValue({ ...mockPart, ...updateDto });
  
      const result = await service.updatePart(mockPart.id, updateDto);
  
      expect(repository.update).toHaveBeenCalledWith({ id: mockPart.id }, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockPart.id } });
      expect(result).toEqual({ ...mockPart, ...updateDto });
    });
  
    it('should update using manager.getRepository when manager is passed', async () => {
      const mockManagerRepo = {
        update: jest.fn().mockResolvedValue(undefined),
        findOne: jest.fn().mockResolvedValue({ ...mockPart, ...updateDto }),
      };
  
      const mockManager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as unknown as EntityManager;
  
      const result = await service.updatePart(mockPart.id, updateDto, mockManager);
  
      expect(mockManager.getRepository).toHaveBeenCalledWith(VehiclePart);
      expect(mockManagerRepo.update).toHaveBeenCalledWith({ id: mockPart.id }, updateDto);
      expect(mockManagerRepo.findOne).toHaveBeenCalledWith({ where: { id: mockPart.id } });
      expect(result).toEqual({ ...mockPart, ...updateDto });
    });
  });
  
});
