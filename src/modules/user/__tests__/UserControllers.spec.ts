import { CreateUserController } from '../http/controllers/CreateUserController';
import { UpdateCurrentUserController } from '../http/controllers/UpdateCurrentUserController';
import { DeleteCurrentUserController } from '../http/controllers/DeleteCurrentUserController';
import { GetUserProfileController } from '../http/controllers/GetUserProfileController';
import { GetUserByIdController } from '../http/controllers/GetUserByIdController';
import { ListUsersController } from '../http/controllers/ListUsersController';
import { userServiceMock, makeUserOutput } from './http_infra_mocks';
import { HttpError } from '../../../shared/http/HttpError';

const makeReq = (
  body: any = {},
  params: any = {},
  user: any = undefined,
  query: any = {}
) => {
  return {
    body,
    params,
    user,
    raw: { query }
  } as any;
};

describe('User Controllers', () => {
  describe('CreateUserController', () => {
    it('cria usuário válido', async () => {
      const service = userServiceMock();
      const output = makeUserOutput({ id: 10 });

      service.createUser.mockResolvedValue(output);

      const controller = new CreateUserController(service);

      const res = await controller.handle(
        makeReq({
          name: 'John',
          email: 'john@example.com',
          password: '123456',
          type: 'admin',
          cpf: '12345678900',
          phone: '5511999999999'
        })
      );

      expect(res.status).toBe(201);
      expect(res.body).toEqual(output);
    });

    it('falha validação create', async () => {
      const service = userServiceMock();
      const controller = new CreateUserController(service);

      await expect(() =>
        controller.handle(
          makeReq({
            name: 'J',
            email: 'invalid',
            password: '123',
            type: 'admin',
            cpf: '123',
            phone: '0'
          })
        )
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe('UpdateCurrentUserController', () => {
    it('atualiza usuário atual', async () => {
      const service = userServiceMock();
      const output = makeUserOutput({ name: 'Changed' });

      service.updateUser.mockResolvedValue(output);

      const controller = new UpdateCurrentUserController(service);

      const res = await controller.handle(
        makeReq(
          { name: 'Changed' },
          {},
          { sub: 1, type: 'admin' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body?.name).toBe('Changed');
    });

    it('forbidden sem user', async () => {
      const service = userServiceMock();
      const controller = new UpdateCurrentUserController(service);

      await expect(() =>
        controller.handle(makeReq({ name: 'X' }))
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('DeleteCurrentUserController', () => {
    it('deleta usuário atual', async () => {
      const service = userServiceMock();
      const controller = new DeleteCurrentUserController(service);

      const res = await controller.handle(
        makeReq(
          {},
          {},
          { sub: 1, type: 'admin' }
        )
      );

      expect(res.status).toBe(204);
      expect(service.deleteUser).toHaveBeenCalledWith(1);
    });

    it('forbidden sem user', async () => {
      const service = userServiceMock();
      const controller = new DeleteCurrentUserController(service);

      await expect(() =>
        controller.handle(makeReq())
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('GetUserProfileController', () => {
    it('retorna perfil', async () => {
      const service = userServiceMock();
      const output = makeUserOutput({ id: 3 });

      service.findById.mockResolvedValue(output as any);

      const controller = new GetUserProfileController(service);

      const res = await controller.handle(
        makeReq(
          {},
          {},
          { sub: 3, type: 'admin' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body?.id).toBe(3);
    });

    it('forbidden sem user', async () => {
      const service = userServiceMock();
      const controller = new GetUserProfileController(service);

      await expect(() =>
        controller.handle(makeReq())
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('GetUserByIdController', () => {
    it('admin pode buscar outro usuário', async () => {
      const service = userServiceMock();
      const output = makeUserOutput({ id: 7 });

      service.findById.mockResolvedValue(output);

      const controller = new GetUserByIdController(service);

      const res = await controller.handle(
        makeReq(
          {},
          { id: '7' },
          { sub: 1, type: 'admin' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body?.id).toBe(7);
    });

    it('mesmo usuário pode buscar a si', async () => {
      const service = userServiceMock();
      const output = makeUserOutput({ id: 5 });

      service.findById.mockResolvedValue(output);

      const controller = new GetUserByIdController(service);

      const res = await controller.handle(
        makeReq(
          {},
          { id: '5' },
          { sub: 5, type: 'mechanic' }
        )
      );

      expect(res.status).toBe(200);
    });

    it('forbidden outro usuário sem admin', async () => {
      const service = userServiceMock();
      const controller = new GetUserByIdController(service);

      await expect(() =>
        controller.handle(
          makeReq(
            {},
            { id: '9' },
            { sub: 5, type: 'mechanic' }
          )
        )
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('ListUsersController', () => {
    it('admin lista usuários', async () => {
      const service = userServiceMock();

      service.list.mockResolvedValue([
        makeUserOutput({ id: 1 }),
        makeUserOutput({ id: 2 })
      ]);

      service.countAll.mockResolvedValue(2);

      const controller = new ListUsersController(service);

      const res = await controller.handle(
        makeReq(
          {},
          {},
          { sub: 1, type: 'admin' },
          { page: '1', limit: '10' }
        )
      );

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(2);
      expect(res.body.total).toBe(2);
    });

    it('forbidden se não admin', async () => {
      const service = userServiceMock();
      const controller = new ListUsersController(service);

      await expect(() =>
        controller.handle(
          makeReq(
            {},
            {},
            { sub: 2, type: 'mechanic' }
          )
        )
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
