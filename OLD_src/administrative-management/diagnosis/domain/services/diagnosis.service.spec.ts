import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisService } from './diagnosis.service';
import { VehicleService } from '../../../vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Diagnosis } from '../entities/diagnosis.entity';
import { NotFoundException } from '@nestjs/common';

describe('DiagnosisService', () => {
  let service: DiagnosisService;
  let vehicleService: VehicleService;
  let userService: UserService;
  let dataSource: DataSource;

  const mockDiagnosisRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockManager = {
    getRepository: jest.fn(() => mockDiagnosisRepository),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const mockQueryRunner = {
      manager: mockManager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn(() => mockDiagnosisRepository),
      createQueryRunner: jest.fn(() => mockQueryRunner),
      transaction: jest.fn(async (fn) => {
        return await fn(mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosisService,
        {
          provide: VehicleService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DiagnosisService>(DiagnosisService);
    vehicleService = module.get<VehicleService>(VehicleService);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);
  });


  describe('create', () => {
    it('should create and return a diagnosis', async () => {
      const dto = {
        description: 'Diagnóstico válido com mais de 10 caracteres',
        vehicleId: 1,
        responsibleMechanicId: 2,
      };

      (vehicleService.findById as jest.Mock).mockResolvedValue({ id: dto.vehicleId });
      (userService.findById as jest.Mock).mockResolvedValue({ id: dto.responsibleMechanicId });

      mockDiagnosisRepository.save.mockResolvedValue({ id: 123, ...dto });

      const result = await service.create(dto);

      expect(vehicleService.findById).toHaveBeenCalledWith(dto.vehicleId);
      expect(userService.findById).toHaveBeenCalledWith(dto.responsibleMechanicId);
      expect(mockDiagnosisRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 123, ...dto });
    });

    it('should create even if responsibleMechanicId is undefined', async () => {
      const dto = {
        description: 'Outro diagnóstico válido',
        vehicleId: 1,
        responsibleMechanicId: undefined,
      };

      (vehicleService.findById as jest.Mock).mockResolvedValue({ id: dto.vehicleId });
      (userService.findById as jest.Mock).mockResolvedValue(null);

      mockDiagnosisRepository.save.mockResolvedValue({ id: 124, ...dto });

      const result = await service.create(dto);

      expect(vehicleService.findById).toHaveBeenCalledWith(dto.vehicleId);
      expect(userService.findById).toHaveBeenCalledWith(dto.responsibleMechanicId);
      expect(mockDiagnosisRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 124, ...dto });
    });
  });

  describe('findById', () => {
    it('should return a diagnosis if found', async () => {
      const diagnosis = { id: 1, description: 'desc', vehicleId: 1, responsibleMechanicId: 2, deletedAt: null };
      mockDiagnosisRepository.findOneBy.mockResolvedValue(diagnosis);

      const result = await service.findById(1);

      expect(mockDiagnosisRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(diagnosis);
    });

    it('should throw NotFoundException if diagnosis not found', async () => {
      mockDiagnosisRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockDiagnosisRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });
});
