import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, notFound } from '../../../shared/http/HttpError';
import { ServiceOrderMySqlRepository } from '../infra/ServiceOrderMySqlRepository';
import { ServiceOrderHistoryMongoRepository } from '../../service-order-history/infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderService } from '../application/ServiceOrderService';
import { ServiceOrderEntity, ServiceOrderStatus } from '../domain/ServiceOrder';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createSchema = z.object({
  vehicleId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  description: z.string().min(3),
  status: z.string().optional(),
  mechanicId: z.number().int().positive().optional(),
});

const allowedStatuses: ServiceOrderStatus[] = [
  'CREATED',
  'APPROVED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
];

const changeStatusSchema = z.object({
  status: z.enum(allowedStatuses as [ServiceOrderStatus, ...ServiceOrderStatus[]])
});

export class CreateServiceOrderController implements Controller {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const entity = ServiceOrderEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);

    return {
      status: 201,
      body: created.toJSON()
    };
  }
}

export class GetServiceOrderController implements Controller {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);

    if (!found) {
      throw notFound('Service order not found');
    }

    return {
      status: 200,
      body: found.toJSON()
    };
  }
}

export class ChangeStatusController implements Controller {
  constructor(private readonly service: ServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = changeStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const userId = req.user?.sub;
    const updated = await this.service.changeStatus(
      id,
      parsed.data.status as ServiceOrderStatus,
      userId
    );

    return {
      status: 200,
      body: updated
    };
  }
}

export class AssignMechanicController implements Controller {
  constructor(private readonly service: ServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const mechanicId = Number(req.params.mechanicId);

    const updated = await this.service.assignMechanic(id, mechanicId);

    return {
      status: 200,
      body: updated
    };
  }
}

export class DeleteServiceOrderController implements Controller {
  constructor(private readonly service: ServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.service.delete(id);

    return {
      status: 204
    };
  }
}

export class ListServiceOrdersController implements Controller {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}

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

export function buildServiceOrderService() {
  const repo = new ServiceOrderMySqlRepository();
  const history = new ServiceOrderHistoryMongoRepository();

  return {
    service: new ServiceOrderService(repo, history),
    repo
  };
}
