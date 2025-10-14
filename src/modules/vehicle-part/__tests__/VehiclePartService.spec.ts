import { VehiclePartService } from '../application/VehiclePartService';
import { partRepoMock, makePart } from './mocks';
import { VehiclePartEntity, VehiclePartProps } from '../domain/VehiclePart';
import { NotFoundServerException } from '../../../shared/application/ServerException';

const makeSut = () => {
  const repo = partRepoMock();

  const sut = new VehiclePartService(repo);

  return {
    sut,
    repo
  };
};

describe('VehiclePartService.createVehiclePart', () => {
  it('cria peça e retorna toJSON', async () => {
    const { sut, repo } = makeSut();

    repo.create.mockImplementation(async (entity: VehiclePartEntity) => {
      return makePart({ ...entity.toJSON(), id: 55 });
    });

    const result = await sut.createVehiclePart({
      type: 'ENGINE',
      name: 'Spark Plug',
      description: 'Desc',
      quantity: 10,
      price: 25
    });

    expect(result.id).toBe(55);
    expect(repo.create).toHaveBeenCalled();
  });
});

describe('VehiclePartService.updateVehiclePart', () => {
  it('atualiza peça existente', async () => {
    const { sut, repo } = makeSut();

    const existing = makePart();

    repo.update.mockImplementation(async (_id: number, partial: Partial<VehiclePartProps>) => {
      return makePart({ ...existing.toJSON(), ...partial });
    });

    const result = await sut.updateVehiclePart(1, { price: 300 });

    expect(result.price).toBe(300);
  });

  it('erro se peça não encontrada', async () => {
    const { sut, repo } = makeSut();

    repo.update.mockResolvedValueOnce(null as any);

    await expect(() => sut.updateVehiclePart(1, { price: 50 }))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehiclePartService.deleteVehiclePart', () => {
  it('soft delete após validar existência', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(makePart());

    await sut.deleteVehiclePart(1);

    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('erro se peça não existe', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() => sut.deleteVehiclePart(1))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehiclePartService.findById', () => {
  it('retorna peça', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(makePart({ id: 7 }));

    const result = await sut.findById(7);

    expect(result.id).toBe(7);
  });

  it('erro not found', async () => {
    const { sut, repo } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() => sut.findById(7))
      .rejects
      .toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehiclePartService.findByIds', () => {
  it('retorna apenas existentes', async () => {
    const { sut, repo } = makeSut();

    repo.findById
      .mockResolvedValueOnce(makePart({ id: 1 }))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makePart({ id: 3 }));

    const result = await sut.findByIds([1, 2, 3]);

    expect(result.map(r => r.id)).toEqual([1, 3]);
  });
});

describe('VehiclePartService.list & countAll', () => {
  it('lista partes', async () => {
    const { sut, repo } = makeSut();

    repo.list.mockResolvedValue([
      makePart({ id: 1 }),
      makePart({ id: 2, name: 'Alt' })
    ]);

    const result = await sut.list(0, 10);

    expect(result).toHaveLength(2);
  });

  it('countAll retorna número', async () => {
    const { sut, repo } = makeSut();

    repo.countAll.mockResolvedValue(12);

    const count = await sut.countAll();

    expect(count).toBe(12);
  });
});
