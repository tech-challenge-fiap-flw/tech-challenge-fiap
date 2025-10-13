import { DiagnosisService } from '../application/DiagnosisService';
import { makeDiagnosisEntity } from './mocks';

const repo = {
  transaction: jest.fn(async (fn: any) => {
    return fn();
  }),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

const vehicleService = { findById: jest.fn() };
const userService = { findById: jest.fn() };

function setup() {
  return new DiagnosisService(
    repo as any,
    vehicleService as any,
    userService as any
  );
}

describe('DiagnosisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    repo.transaction.mockImplementation(async (fn: any) => {
      return fn();
    });
  });

  describe('create', () => {
    it('cria sem mechanicId', async () => {
      const service = setup();

      vehicleService.findById.mockResolvedValue({ id: 10 });

      repo.create.mockResolvedValue(
        makeDiagnosisEntity({ id: 1 })
      );

      const out = await service.create({
        description: 'Noise',
        vehicleId: 10
      });

      expect(out.id).toBe(1);

      expect(vehicleService.findById).toHaveBeenCalledWith(10);

      expect(userService.findById).not.toHaveBeenCalled();
    });

    it('cria com mechanicId', async () => {
      const service = setup();

      vehicleService.findById.mockResolvedValue({ id: 10 });

      userService.findById.mockResolvedValue({ id: 5 });

      repo.create.mockResolvedValue(
        makeDiagnosisEntity({ id: 2, mechanicId: 5 })
      );

      const out = await service.create({
        description: 'Vibration',
        vehicleId: 10,
        mechanicId: 5
      });

      expect(out.mechanicId).toBe(5);

      expect(vehicleService.findById).toHaveBeenCalled();

      expect(userService.findById).toHaveBeenCalledWith(5);
    });

    it('erro vehicle não encontrado', async () => {
      const service = setup();

      vehicleService.findById.mockRejectedValue(
        Object.assign(
          new Error('Vehicle not found'),
          { status: 404 }
        )
      );

      await expect(
        service.create({ description: 'Noise', vehicleId: 99 })
      ).rejects.toThrow('Vehicle not found');
    });

    it('erro mechanic não encontrado', async () => {
      const service = setup();

      vehicleService.findById.mockResolvedValue({ id: 10 });

      userService.findById.mockRejectedValue(
        Object.assign(
          new Error('User not found'),
          { status: 404 }
        )
      );

      await expect(
        service.create({
          description: 'Noise',
          vehicleId: 10,
          mechanicId: 77
        })
      ).rejects.toThrow('User not found');
    });

    it('erro interno dentro da transação', async () => {
      const service = setup();

      vehicleService.findById.mockResolvedValue({ id: 10 });

      repo.create.mockRejectedValue(new Error('DB fail'));

      await expect(
        service.create({ description: 'Noise', vehicleId: 10 })
      ).rejects.toThrow('DB fail');

      expect(repo.transaction).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('retorna diagnóstico', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(
        makeDiagnosisEntity({ id: 3 })
      );

      const out = await service.findById(3);

      expect(out.id).toBe(3);
    });

    it('not found', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(null);

      await expect(
        service.findById(999)
      ).rejects.toThrow('Diagnosis not found');
    });
  });

  describe('updateDiagnosis', () => {
    it('atualiza com sucesso', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(
        makeDiagnosisEntity({ id: 4 })
      );

      repo.update.mockResolvedValue(
        makeDiagnosisEntity({ id: 4, description: 'Updated' })
      );

      const out = await service.updateDiagnosis(
        4,
        { description: 'Updated' }
      );

      expect(out.description).toBe('Updated');
    });

    it('not found dispara erro', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateDiagnosis(5, { description: 'X' })
      ).rejects.toThrow('Diagnosis not found');
    });
  });

  describe('deleteDiagnosis', () => {
    it('deleta após encontrar', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(
        makeDiagnosisEntity({ id: 6 })
      );

      await service.deleteDiagnosis(6);

      expect(repo.softDelete).toHaveBeenCalledWith(6);
    });

    it('not found', async () => {
      const service = setup();

      repo.findById.mockResolvedValue(null);

      await expect(
        service.deleteDiagnosis(7)
      ).rejects.toThrow('Diagnosis not found');
    });
  });

  describe('list & count', () => {
    it('list retorna itens', async () => {
      const service = setup();

      repo.list.mockResolvedValue([
        makeDiagnosisEntity({ id: 8 })
      ]);

      const out = await service.list(0, 10);

      expect(out).toHaveLength(1);

      expect(out[0].id).toBe(8);
    });

    it('countAll delega', async () => {
      const service = setup();

      repo.countAll.mockResolvedValue(42);

      const total = await service.countAll();

      expect(total).toBe(42);
    });
  });
});
