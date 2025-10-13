import { CreateDiagnosisController } from '../http/controllers/CreateDiagnosisController';
import { UpdateDiagnosisController } from '../http/controllers/UpdateDiagnosisController';
import { DeleteDiagnosisController } from '../http/controllers/DeleteDiagnosisController';
import { GetDiagnosisController } from '../http/controllers/GetDiagnosisController';
import { ListDiagnosesController } from '../http/controllers/ListDiagnosesController';
import { HttpError } from '../../../shared/http/HttpError';

const makeReq = (body: any = {}, params: any = {}, query: any = {}) => ({ body, params, query, raw: { query } } as any);

function serviceMock() {
  return {
    create: jest.fn(),
    updateDiagnosis: jest.fn(),
    deleteDiagnosis: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    countAll: jest.fn(),
  };
}

describe('Diagnosis Controllers', () => {
  describe('CreateDiagnosisController', () => {
    it('cria diagnosis', async () => {
      const service = serviceMock();
      service.create.mockResolvedValue({ id: 1, description: 'Noise', vehicleId: 10, creationDate: new Date(), mechanicId: null, deletedAt: null });
      const controller = new CreateDiagnosisController(service as any);
      const res = await controller.handle(makeReq({ description: 'Noise', vehicleId: 10 }));
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(1);
    });
    it('falha validação', async () => {
      const service = serviceMock();
      const controller = new CreateDiagnosisController(service as any);
      await expect(controller.handle(makeReq({ description: 'No', vehicleId: -1 }))).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('UpdateDiagnosisController', () => {
    it('atualiza diagnosis', async () => {
      const service = serviceMock();
      service.updateDiagnosis.mockResolvedValue({ id: 2, description: 'Updated', vehicleId: 10, creationDate: new Date(), mechanicId: null, deletedAt: null });
      const controller = new UpdateDiagnosisController(service as any);
      const res = await controller.handle(makeReq({ description: 'Updated' }, { id: '2' }));
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
    });
    it('falha validação update', async () => {
      const service = serviceMock();
      const controller = new UpdateDiagnosisController(service as any);
      await expect(controller.handle(makeReq({ description: 'No' }, { id: '2' }))).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('DeleteDiagnosisController', () => {
    it('deleta diagnosis', async () => {
      const service = serviceMock();
      const controller = new DeleteDiagnosisController(service as any);
      const res = await controller.handle(makeReq({}, { id: '3' }));
      expect(res.status).toBe(204);
    });
  });

  describe('GetDiagnosisController', () => {
    it('retorna diagnosis', async () => {
      const service = serviceMock();
      service.findById.mockResolvedValue({ id: 4, description: 'Noise', vehicleId: 10, creationDate: new Date(), mechanicId: null, deletedAt: null });
      const controller = new GetDiagnosisController(service as any);
      const res = await controller.handle(makeReq({}, { id: '4' }));
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(4);
    });
  });

  describe('ListDiagnosesController', () => {
    it('lista diagnoses', async () => {
      const service = serviceMock();
      service.list.mockResolvedValue([
        { id: 5, description: 'A', vehicleId: 10, creationDate: new Date(), mechanicId: null, deletedAt: null },
        { id: 6, description: 'B', vehicleId: 11, creationDate: new Date(), mechanicId: null, deletedAt: null },
      ]);
      service.countAll.mockResolvedValue(2);
      const controller = new ListDiagnosesController(service as any);
      const res = await controller.handle(makeReq({}, {}, { page: '1', limit: '10' }));
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
      expect(res.body.total).toBe(2);
    });
  });
});
