import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { ServiceOrderMySqlRepository } from '../../infra/ServiceOrderMySqlRepository';
import { ServiceOrderEntity } from '../../domain/ServiceOrder';
import { createServiceOrderSchema } from './schemas';

export class CreateServiceOrderController implements IController {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createServiceOrderSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    const entity = ServiceOrderEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);
    return { status: 201, body: created.toJSON() };
  }
}
