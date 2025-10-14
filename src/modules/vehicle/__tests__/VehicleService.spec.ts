import { VehicleService } from '../application/VehicleService';
import { vehicleRepoMock, makeVehicle, userServiceMock, userServiceNotFoundMock } from './mocks';
import { BadRequestServerException, NotFoundServerException } from '../../../shared/application/ServerException';

const makeSut = () => {
  const repo = vehicleRepoMock();
  const userSvc = userServiceMock();

  const sut = new VehicleService(repo, userSvc);

  const user: any = { sub: 1, type: 'customer' };

  return {
    sut,
    repo,
    userSvc,
    user
  };
};

const makeSutUserNotFound = () => {
  const repo = vehicleRepoMock();
  const userSvc = userServiceNotFoundMock();

  const sut = new VehicleService(repo, userSvc);

  const user: any = { sub: 1, type: 'customer' };

  return {
    sut,
    repo,
    userSvc,
    user
  };
};

describe('VehicleService.createVehicle', () => {
  it('cria veículo quando placa não existe e owner existe', async () => {
    const { sut, repo } = makeSut();

    repo.findByIdPlate.mockResolvedValueOnce(null);

    repo.create.mockImplementation(async (entity) => {
      return makeVehicle({ ...entity.toJSON(), id: 99 });
    });

    const result = await sut.createVehicle({
      idPlate: 'XYZ9876',
      type: 'CAR',
      model: 'Civic',
      brand: 'Honda',
      manufactureYear: 2021,
      modelYear: 2022,
      color: 'White',
      ownerId: 10
    });

    expect(result.id).toBe(99);
    expect(repo.create).toHaveBeenCalled();
  });

  it('erro se placa existente', async () => {
    const { sut, repo } = makeSut();

    repo.findByIdPlate.mockResolvedValueOnce(makeVehicle());

    await expect(() =>
      sut.createVehicle({
        idPlate: 'ABC1234',
        type: 'CAR',
        model: 'X',
        brand: 'Y',
        manufactureYear: 2020,
        modelYear: 2021,
        color: 'Blue',
        ownerId: 10
      })
    ).rejects.toBeInstanceOf(BadRequestServerException);
  });

  it('erro se owner não encontrado', async () => {
    const { sut, repo } = makeSutUserNotFound();

    repo.findByIdPlate.mockResolvedValueOnce(null);

    await expect(() =>
      sut.createVehicle({
        idPlate: 'NEW1111',
        type: 'CAR',
        model: 'Z',
        brand: 'Brand',
        manufactureYear: 2020,
        modelYear: 2021,
        color: 'Red',
        ownerId: 999
      })
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleService.updateVehicle', () => {
  it('atualiza veículo existente', async () => {
    const { sut, repo, user } = makeSut();

    const existing = makeVehicle();

    repo.update.mockImplementation(async (_id, partial, _userId) => {
      return makeVehicle({ ...existing.toJSON(), ...partial });
    });

    const result = await sut.updateVehicle(1, { color: 'Green' }, user);

    expect(result!.color).toBe('Green');
  });

  it('erro se veículo não encontrado', async () => {
  const { sut, repo, user } = makeSut();

  repo.update.mockResolvedValueOnce(null as any);

    await expect(() =>
      sut.updateVehicle(1, { color: 'Purple' }, user)
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleService.deleteVehicle', () => {
  it('soft delete após encontrar veículo', async () => {
  const { sut, repo, user } = makeSut();

    const existing = makeVehicle();

  repo.findById.mockResolvedValue(existing);

  await sut.deleteVehicle(1, user);

    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('erro se veículo não existe', async () => {
  const { sut, repo, user } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() =>
      sut.deleteVehicle(1, user)
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleService.findById', () => {
  it('retorna veículo', async () => {
  const { sut, repo, user } = makeSut();

    const existing = makeVehicle({ id: 5 });

  repo.findById.mockResolvedValue(existing);

  const result = await sut.findById(5, user);

    expect(result.id).toBe(5);
  });

  it('erro not found', async () => {
  const { sut, repo, user } = makeSut();

    repo.findById.mockResolvedValue(null);

    await expect(() =>
      sut.findById(5, user)
    ).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('VehicleService.list & countAll', () => {
  it('lista veículos', async () => {
  const { sut, repo, user } = makeSut();

    repo.list.mockResolvedValue([
      makeVehicle({ id: 1 }),
      makeVehicle({ id: 2, idPlate: 'DEF5678' })
    ]);

  const result = await sut.list(0, 10, user);

    expect(result).toHaveLength(2);
    expect(result[1].idPlate).toBe('DEF5678');
  });

  it('countAll retorna número', async () => {
  const { sut, repo, user } = makeSut();

    repo.countAll.mockResolvedValue(7);

  const count = await sut.countAll(user);

    expect(count).toBe(7);
  });
});
