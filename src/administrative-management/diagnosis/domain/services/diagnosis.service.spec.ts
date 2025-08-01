import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisService } from './diagnosis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Diagnosis } from '../entities/diagnosis.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../../../../administrative-management/vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';

const mockRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  softRemove: jest.fn(),
});

const mockVehicleService = () => ({
  findById: jest.fn(),
});

const mockUserService = () => ({
  findById: jest.fn(),
});

describe('DiagnosisService', () => {
  let service: DiagnosisService;
  let repo: jest.Mocked<Repository<Diagnosis>>;
  let vehicleService: ReturnType<typeof mockVehicleService>;
  let userService: ReturnType<typeof mockUserService>;

  const mockDiagnosis: Diagnosis = {
    id: 1,
    description: 'Problema no motor',
    creationDate: new Date(),
    vehicleId: 10,
    responsibleMechanicId: 100,
    vehicle: null,
    responsibleMechanic: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosisService,
        { provide: getRepositoryToken(Diagnosis), useFactory: mockRepository },
        { provide: VehicleService, useFactory: mockVehicleService },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get(DiagnosisService);
    repo = module.get(getRepositoryToken(Diagnosis));
    vehicleService = module.get(VehicleService);
    userService = module.get(UserService);
  });

  describe('create', () => {
    it('should validate vehicle and user, then save diagnosis', async () => {
      const dto = {
        description: 'Teste',
        vehicleId: 10,
        responsibleMechanicId: 100,
      };

      vehicleService.findById.mockResolvedValue({});
      userService.findById.mockResolvedValue({});
      repo.save.mockResolvedValue(mockDiagnosis);

      const result = await service.create(dto as any);

      expect(vehicleService.findById).toHaveBeenCalledWith(dto.vehicleId);
      expect(userService.findById).toHaveBeenCalledWith(dto.responsibleMechanicId);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDiagnosis);
    });
  });

  describe('findAllByVehicleId', () => {
    it('should return diagnostics by vehicleId', async () => {
      repo.find.mockResolvedValue([mockDiagnosis]);

      const result = await service.findAllByVehicleId(10);

      expect(repo.find).toHaveBeenCalledWith({ where: { vehicleId: 10 } });
      expect(result).toEqual([mockDiagnosis]);
    });

    it('should throw NotFoundException if no diagnosis found', async () => {
      repo.find.mockResolvedValue([]);

      await expect(service.findAllByVehicleId(10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a diagnosis by id', async () => {
      repo.findOneBy.mockResolvedValue(mockDiagnosis);

      const result = await service.findById(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockDiagnosis);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should validate, find, merge and save diagnosis', async () => {
      const dto = {
        description: 'Atualizado',
        vehicleId: 10,
        responsibleMechanicId: 100,
      };

      vehicleService.findById.mockResolvedValue({});
      userService.findById.mockResolvedValue({});
      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockDiagnosis });
      repo.save.mockResolvedValue({ ...mockDiagnosis, ...dto });

      const result = await service.update(1, dto as any);

      expect(vehicleService.findById).toHaveBeenCalledWith(dto.vehicleId);
      expect(userService.findById).toHaveBeenCalledWith(dto.responsibleMechanicId);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(repo.save).toHaveBeenCalled();
      expect(result.description).toBe('Atualizado');
    });
  });

  describe('remove', () => {
    it('should call findById and softRemove', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockDiagnosis);
      repo.softRemove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(repo.softRemove).toHaveBeenCalledWith(mockDiagnosis);
    });
  });
});
