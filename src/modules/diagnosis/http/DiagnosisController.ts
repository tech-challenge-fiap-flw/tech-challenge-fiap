import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, notFound } from '../../../shared/http/HttpError';
import { DiagnosisMySqlRepository } from '../infra/DiagnosisMySqlRepository';
import { DiagnosisEntity } from '../domain/Diagnosis';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createSchema = z.object({
  description: z.string().min(3),
  vehicleId: z.number().int().positive(),
  mechanicId: z.number().int().positive().optional(),
  status: z.string().optional(),
});

const updateSchema = createSchema.partial();

export class CreateDiagnosisController implements Controller {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const entity = DiagnosisEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);

    return {
      status: 201,
      body: created.toJSON()
    };
  }
}

export class GetDiagnosisController implements Controller {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);

    if (!found) {
      throw notFound('Diagnosis not found');
    }

    return {
      status: 200,
      body: found.toJSON()
    };
  }
}

export class UpdateDiagnosisController implements Controller {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}

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

export class DeleteDiagnosisController implements Controller {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.repo.softDelete(id);

    return {
      status: 204
    };
  }
}

export class ListDiagnosesController implements Controller {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}

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
