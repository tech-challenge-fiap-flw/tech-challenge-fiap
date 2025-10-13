import { VehicleServiceService } from '../application/VehicleServiceService';
import { serviceRepoMock, makeService } from './mocks';
import { NotFoundServerException } from '../../../shared/application/ServerException';
import { VehicleServiceProps, VehicleServiceEntity } from '../domain/VehicleService';

const makeSut = () => {
  const repo = serviceRepoMock();

  const sut = new VehicleServiceService(repo);

  return {
    sut,
    repo
  };
};

describe('VehicleServiceService.createVehicleService', () => {
  it('cria service e retorna toJSON', async () => {
    const { sut, repo } = makeSut();

    repo.create.mockImplementation(async (entity: VehicleServiceEntity) => {
      return makeService({
        ...entity.toJSON(),
        id: 77
      });
    });

    const result = await sut.createVehicleService({
      name: 'Balancing',
      price: 90,
      description: 'Wheel balancing'
    });

    expect(result.id).toBe(77);
    expect(repo.create).toHaveBeenCalled();
  });
});

describe('VehicleServiceService.updateVehicleService', () => {
  it('atualiza service existente', async () => {
    const { sut, repo } = makeSut();

    const existing = makeService();

    repo.update.mockImplementation(async (_id: number, partial: Partial<VehicleServiceProps>) => {
      return makeService({
        ...existing.toJSON(),
        ...partial
      });
    });

    const result = await sut.updateVehicleService(1, { price: 200 });

    expect(result.price).toBe(200);
  });

  it('erro se service não encontrado', async () => {
    const { sut, repo } = makeSut();

    repo.update.mockResolvedValueOnce(null as any);

    await expect(() => sut.updateVehicleService(1, { price: 50 }))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleServiceService.deleteVehicleService', () => {
  it('soft delete após validar existência', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(makeService());

    await sut.deleteVehicleService(1);

    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('erro se service não existe', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() => sut.deleteVehicleService(1))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleServiceService.findById', () => {
  it('retorna service', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(makeService({ id: 5 }));

    const result = await sut.findById(5);

    expect(result.id).toBe(5);
  });

  it('erro not found', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() => sut.findById(5))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleServiceService.findByIds', () => {
  it('retorna apenas existentes', async () => {
    const { sut, repo } = makeSut();

    repo.findById
      .mockResolvedValueOnce(makeService({ id: 1 }))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeService({ id: 3 }));

    const result = await sut.findByIds([1, 2, 3]);

    expect(result.map(r => r.id)).toEqual([1, 3]);
  });
});

describe('VehicleServiceService.list & countAll', () => {
  it('lista services', async () => {
    const { sut, repo } = makeSut();

    repo.list.mockResolvedValue([
      makeService({ id: 1 }),
      makeService({ id: 2, name: 'Alt' })
    ]);

    const result = await sut.list(0, 10);

    expect(result).toHaveLength(2);
  });

  it('countAll retorna número', async () => {
    const { sut, repo } = makeSut();

    repo.countAll.mockResolvedValue(9);

    const count = await sut.countAll();

    expect(count).toBe(9);
  });
});
