import { UserService } from '../application/UserService';
import { BadRequestServerException, NotFoundServerException } from '../../../shared/application/ServerException';
import { hasherMock, repoMock, makeUser } from './mocks';

const makeSut = () => {
  const repo = repoMock();
  const hasher = hasherMock();
  const sut = new UserService(repo, hasher);
  return { sut, repo, hasher };
};

describe('UserService.createUser', () => {
  it('cria usuário com hash e remove password do output', async () => {
    const { sut, repo } = makeSut();
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.create.mockImplementation(async (entity) => {
      return makeUser({ ...entity.toJSON(), id: 10 });
    });

    const result = await sut.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
      type: 'CLIENT',
      cpf: '12345678900',
      phone: '5511999999999',
      cnpj: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
    });

    expect(result).toMatchObject({ id: 10, email: 'john@example.com' });
    // password não deve existir no output
    expect((result as any).password).toBeUndefined();
    expect(repo.create).toHaveBeenCalled();
  });

  it('lança erro se email já existe', async () => {
    const { sut, repo } = makeSut();
    repo.findByEmail.mockResolvedValueOnce(makeUser());

    await expect(() => sut.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
      type: 'CLIENT',
      cpf: '12345678900',
      phone: '5511999999999',
      cnpj: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
    })).rejects.toBeInstanceOf(BadRequestServerException);
  });
});

describe('UserService.updateUser', () => {
  it('lança erro se usuário não encontrado', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(null);

    await expect(() => sut.updateUser(1, { name: 'Changed' })).rejects.toBeInstanceOf(NotFoundServerException);
  });

  it('atualiza com hash de nova senha', async () => {
    const { sut, repo, hasher } = makeSut();
    const existing = makeUser();
    repo.findById.mockResolvedValue(existing);
    repo.update.mockImplementation(async (_id, partial) => {
      return makeUser({ ...existing.toJSON(), ...partial });
    });

    const result = await sut.updateUser(1, { password: 'newpass', name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(repo.update).toHaveBeenCalled();
    expect(hasher.hash).toHaveBeenCalledWith('newpass');
    expect((result as any).password).toBeUndefined();
  });

  it('atualiza sem alterar senha quando não fornecida', async () => {
    const { sut, repo, hasher } = makeSut();
    const existing = makeUser();
    repo.findById.mockResolvedValue(existing);
    repo.update.mockImplementation(async (_id, partial) => {
      return makeUser({ ...existing.toJSON(), ...partial });
    });

    const result = await sut.updateUser(1, { name: 'Another Name' });
    expect(result.name).toBe('Another Name');
    expect(hasher.hash).not.toHaveBeenCalled();
  });
});

describe('UserService.deleteUser', () => {
  it('soft delete após validar existência', async () => {
    const { sut, repo } = makeSut();
    const existing = makeUser();
    repo.findById.mockResolvedValue(existing);

    await sut.deleteUser(1);

    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it('erro se usuário não existe', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValue(null);

    await expect(() => sut.deleteUser(1)).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('UserService.findById', () => {
  it('retorna usuário sem password', async () => {
    const { sut, repo } = makeSut();
    const existing = makeUser();
    repo.findById.mockResolvedValue(existing);

    const result = await sut.findById(1);
    expect(result.email).toBe(existing.toJSON().email);
    expect((result as any).password).toBeUndefined();
  });

  it('erro not found', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValue(null);
    await expect(() => sut.findById(1)).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('UserService.findByEmail', () => {
  it('retorna entidade', async () => {
    const { sut, repo } = makeSut();
    const existing = makeUser();
    repo.findByEmail.mockResolvedValue(existing);

    const result = await sut.findByEmail('john@example.com');
    expect(result).toBe(existing);
  });

  it('erro not found', async () => {
    const { sut, repo } = makeSut();
    repo.findByEmail.mockResolvedValue(null);

    await expect(() => sut.findByEmail('missing@example.com')).rejects.toBeInstanceOf(NotFoundServerException);
  });
});

describe('UserService.list & countAll', () => {
  it('lista removendo password', async () => {
    const { sut, repo } = makeSut();
    const u1 = makeUser({ id: 1 });
    const u2 = makeUser({ id: 2, email: 'jane@example.com' });
    repo.list.mockResolvedValue([u1, u2]);

    const result = await sut.list(0, 10);
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe(u1.toJSON().email);
    expect((result[0] as any).password).toBeUndefined();
  });

  it('countAll retorna número', async () => {
    const { sut, repo } = makeSut();
    repo.countAll.mockResolvedValue(42);

    const count = await sut.countAll();
    expect(count).toBe(42);
  });
});
