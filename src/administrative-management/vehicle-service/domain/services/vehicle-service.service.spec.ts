import { Test, TestingModule } from '@nestjs/testing';
import { VehicleServiceService } from '../services/vehicle-service.service';
import { VehicleService } from '../entities/vehicle-service.entity';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('VehicleServiceService', () => {
  let service: VehicleServiceService;
  let repository: Repository<VehicleService>;
  let dataSource: DataSource;

  const mockVehicleService: VehicleService = {
    id: 1,
    name: 'Troca de óleo',
    price: 100,
    description: 'Troca de óleo sintético',
    deletedAt: null,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleServiceService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<VehicleServiceService>(VehicleServiceService);
    repository = mockDataSource.getRepository(VehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a vehicle service', async () => {
      const dto = { name: 'Troca de óleo', price: 100, description: 'Troca de óleo sintético' };

      mockRepository.create.mockReturnValue(mockVehicleService);
      mockRepository.save.mockResolvedValue(mockVehicleService);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockVehicleService);
      expect(result).toEqual(mockVehicleService);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle service if found', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicleService);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockVehicleService);
    });

    it('should throw NotFoundException if service not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all vehicle services', async () => {
      mockRepository.find.mockResolvedValue([mockVehicleService]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockVehicleService]);
    });
  });

  describe('update', () => {
    it('should update and save the vehicle service', async () => {
      const updateDto = { name: 'Novo nome', description: 'Nova descrição' };

      // Mock findOne to return existing service
      jest.spyOn(service, 'findOne').mockResolvedValue(mockVehicleService);

      // Spy on repository.save
      mockRepository.save.mockResolvedValue({
        ...mockVehicleService,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateDto.name);
      expect(result.description).toEqual(updateDto.description);
    });
  });

  describe('remove', () => {
    it('should soft remove the vehicle service', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockVehicleService);
      mockRepository.softRemove.mockResolvedValue(mockVehicleService);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockVehicleService);
    });
  });
});
