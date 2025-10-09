import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, notFound } from '../../../shared/http/HttpError';
import { VehicleMySqlRepository } from '../infra/VehicleMySqlRepository';
import { VehicleService } from '../application/VehicleService';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createVehicleSchema = z.object({
  idPlate: z.string().min(3),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().gte(1900).lte(new Date().getFullYear() + 1),
  color: z.string().min(1),
  ownerId: z.number().int().positive(),
});

const updateVehicleSchema = createVehicleSchema.partial();

export class CreateVehicleController implements Controller {
  constructor(private readonly service: VehicleService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const created = await this.service.createVehicle(parsed.data as any);

    return {
      status: 201,
      body: created
    };
  }
}

export class GetVehicleController implements Controller {
  constructor(private readonly repo: VehicleMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const found = await this.repo.findById(id);

    if (!found) {
      throw notFound('Vehicle not found');
    }

    return {
      status: 200,
      body: found.toJSON()
    };
  }
}

export class UpdateVehicleController implements Controller {
  constructor(private readonly service: VehicleService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const parsed = updateVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const updated = await this.service.updateVehicle(id, parsed.data as any);

    return {
      status: 200,
      body: updated
    };
  }
}

export class DeleteVehicleController implements Controller {
  constructor(private readonly service: VehicleService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.service.deleteVehicle(id);

    return {
      status: 204
    };
  }
}

export class ListVehiclesController implements Controller {
  constructor(private readonly repo: VehicleMySqlRepository) {}

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
