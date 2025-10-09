import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, forbidden, notFound } from '../../../shared/http/HttpError';
import { UserService } from '../application/UserService';
import { UserRepository } from '../domain/UserRepository';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.string(),
  cpf: z.string().min(11).max(14),
  cnpj: z.string().optional().nullable(),
  phone: z.string(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});

const updateUserSchema = createUserSchema.partial();

export class CreateUserController implements Controller {
  constructor(private readonly service: UserService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.createUser(parsed.data);

    return {
      status: 201,
      body: result
    };
  }
}

export class UpdateCurrentUserController implements Controller {
  constructor(private readonly service: UserService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const current = req.user;

    if (!current) {
      throw forbidden();
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const result = await this.service.updateUser(current.sub, parsed.data);

    return {
      status: 200,
      body: result
    };
  }
}

export class DeleteCurrentUserController implements Controller {
  constructor(private readonly service: UserService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const current = req.user;

    if (!current) {
      throw forbidden();
    }

    await this.service.deleteUser(current.sub);

    return {
      status: 204
    };
  }
}

export class GetUserProfileController implements Controller {
  constructor(private readonly repo: UserRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const current = req.user;

    if (!current) {
      throw forbidden();
    }

    const user = await this.repo.findById(current.sub);

    if (!user) {
      throw notFound('User not found');
    }

    const { password, ...rest } = user.toJSON();

    return {
      status: 200,
      body: rest
    };
  }
}

export class GetUserByIdController implements Controller {
  constructor(private readonly repo: UserRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const current = req.user;
    const id = Number(req.params.id);

    if (!current) {
      throw forbidden();
    }

    if (current.type !== 'admin' && current.sub !== id) {
      throw forbidden();
    }

    const user = await this.repo.findById(id);

    if (!user) {
      throw notFound('User not found');
    }

    const { password, ...rest } = user.toJSON();

    return {
      status: 200,
      body: rest
    };
  }
}

export class ListUsersController implements Controller {
  constructor(private readonly repo: UserRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const current = req.user;

    if (!current || current.type !== 'admin') {
      throw forbidden();
    }

    const { limit, offset, page } = getPagination(req.raw as any);

    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll()
    ]);

    const users = items.map(i => {
      const { password, ...rest } = i.toJSON();
      return rest;
    });

    return {
      status: 200,
      body: toPage(users, page, limit, total)
    };
  }
}
