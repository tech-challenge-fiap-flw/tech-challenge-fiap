import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, notFound } from '../../../shared/http/HttpError';
import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../domain/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
});

const updateSchema = createSchema.partial();

export class CreateVehicleServiceController implements Controller {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const entity = VehicleServiceEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);

    return {
      status: 201,
      body: created.toJSON()
    };
  }
}

export class GetVehicleServiceController implements Controller {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);

    if (!found) {
      throw notFound('Vehicle service not found');
    }

    return {
      status: 200,
      body: found.toJSON()
    };
  }
}

export class UpdateVehicleServiceController implements Controller {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const updated = await this.repo.update(id, parsed.data as any);

    return {
      status: 200,
      body: updated.toJSON()
    };
  }
}

export class DeleteVehicleServiceController implements Controller {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.repo.softDelete(id);

    return {
      status: 204
    };
  }
}

export class ListVehicleServicesController implements Controller {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);

    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll()
    ]);

    return {
      status: 200,
      body: toPage(
        items.map(i => i.toJSON()),
        page,
        limit,
        total
      )
    };
  }
}
