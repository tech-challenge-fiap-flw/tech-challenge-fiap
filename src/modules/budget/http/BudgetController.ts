import { z } from 'zod';
import { Controller, HttpRequest, HttpResponse } from '../../../shared/http/Controller';
import { badRequest, notFound } from '../../../shared/http/HttpError';
import { BudgetService } from '../application/BudgetService';
import { 
  BudgetMySqlRepository, 
  BudgetVehiclePartMySqlRepository, 
  BudgetVehicleServiceMySqlRepository 
} from '../infra/BudgetMySqlRepositories';
import { getPagination, toPage } from '../../../shared/http/pagination';

const createBudgetSchema = z.object({
  customerId: z.number().int().positive(),
  vehicleId: z.number().int().positive(),
  description: z.string().min(3)
});

const addPartSchema = z.object({
  vehiclePartId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

const addServiceSchema = z.object({
  vehicleServiceId: z.number().int().positive(),
  price: z.number().positive()
});

export class CreateBudgetController implements Controller {
  constructor(private readonly service: BudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createBudgetSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const created = await this.service.createBudget(parsed.data as any);

    return {
      status: 201,
      body: created
    };
  }
}

export class GetBudgetController implements Controller {
  constructor(private readonly repo: BudgetMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const budget = await this.repo.findById(id);

    if (!budget) {
      throw notFound('Budget not found');
    }

    return {
      status: 200,
      body: budget.toJSON()
    };
  }
}

export class AddPartController implements Controller {
  constructor(private readonly service: BudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = addPartSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    await this.service.addPart(
      id,
      parsed.data.vehiclePartId,
      parsed.data.quantity,
      parsed.data.price
    );

    return {
      status: 204
    };
  }
}

export class AddServiceController implements Controller {
  constructor(private readonly service: BudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = addServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    await this.service.addService(
      id,
      parsed.data.vehicleServiceId,
      parsed.data.price
    );

    return {
      status: 204
    };
  }
}

export class RemovePartController implements Controller {
  constructor(private readonly service: BudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const entryId = Number(req.params.entryId);

    await this.service.removePart(entryId, id);

    return {
      status: 204
    };
  }
}

export class RemoveServiceController implements Controller {
  constructor(private readonly service: BudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const entryId = Number(req.params.entryId);

    await this.service.removeService(entryId, id);

    return {
      status: 204
    };
  }
}

export class ListBudgetsController implements Controller {
  constructor(private readonly repo: BudgetMySqlRepository) {}

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

export function buildBudgetService() {
  const budgetRepo = new BudgetMySqlRepository();
  const partRepo = new BudgetVehiclePartMySqlRepository();
  const serviceRepo = new BudgetVehicleServiceMySqlRepository();

  return {
    budgetRepo,
    service: new BudgetService(budgetRepo, partRepo, serviceRepo)
  };
}
