import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { ServiceOrderMySqlRepository } from '../../infra/ServiceOrderMySqlRepository';

export class GetServiceOrderController implements IController {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);
    if (!found) throw notFound('Service order not found');
    return { status: 200, body: found.toJSON() };
  }
}
