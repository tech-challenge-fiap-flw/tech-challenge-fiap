import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from '../../domain/services/diagnosis.service';
import { Diagnosis } from '../../domain/entities/diagnosis.entity';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from '../dto/update-diagnosis.dto';

describe('DiagnosisController', () => {
  let controller: DiagnosisController;
  let service: jest.Mocked<DiagnosisService>;

  const mockDiagnosis: Diagnosis = {
    id: 1,
    description: 'Falha no sistema elétrico',
    vehicleId: 10,
    responsibleMechanicId: 100,
    creationDate: new Date(),
    deletedAt: null,
    vehicle: null,
    responsibleMechanic: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosisController],
      providers: [
        {
          provide: DiagnosisService,
          useValue: {
            create: jest.fn(),
            findAllByVehicleId: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiagnosisController>(DiagnosisController);
    service = module.get(DiagnosisService);
  });

  describe('create', () => {
    it('should create a diagnosis and return DTO', async () => {
      const dto: CreateDiagnosisDto = {
        description: mockDiagnosis.description,
        vehicleId: mockDiagnosis.vehicleId,
        responsibleMechanicId: mockDiagnosis.responsibleMechanicId,
      };

      service.create.mockResolvedValue(mockDiagnosis);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: mockDiagnosis.id,
        description: mockDiagnosis.description,
        vehicleId: mockDiagnosis.vehicleId,
        responsibleMechanicId: mockDiagnosis.responsibleMechanicId,
        creationDate: mockDiagnosis.creationDate,
        deletedAt: mockDiagnosis.deletedAt,
      });
    });
  });

  describe('findAllByVehicleId', () => {
    it('should return diagnostics by vehicleId', async () => {
      service.findAllByVehicleId.mockResolvedValue([mockDiagnosis]);

      const result = await controller.findAllByVehicleId(10);

      expect(service.findAllByVehicleId).toHaveBeenCalledWith(10);
      expect(result).toEqual([
        {
          id: mockDiagnosis.id,
          description: mockDiagnosis.description,
          vehicleId: mockDiagnosis.vehicleId,
          responsibleMechanicId: mockDiagnosis.responsibleMechanicId,
          creationDate: mockDiagnosis.creationDate,
          deletedAt: mockDiagnosis.deletedAt,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return diagnosis by id', async () => {
      service.findById.mockResolvedValue(mockDiagnosis);

      const result = await controller.findOne(1);
      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update and return diagnosis', async () => {
      const dto: UpdateDiagnosisDto = { description: 'Atualizado' };
      const updated = { ...mockDiagnosis, ...dto };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.description).toBe('Atualizado');
    });
  });

  describe('remove', () => {
    it('should call service.remove with the given id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
