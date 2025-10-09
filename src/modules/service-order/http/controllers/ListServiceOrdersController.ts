import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { ServiceOrderMySqlRepository } from '../../infra/ServiceOrderMySqlRepository';
import { getPagination, toPage } from '../../../../shared/http/pagination';

export class ListServiceOrdersController implements IController {
  constructor(private readonly repo: ServiceOrderMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);
    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll()
    ]);
    return { status: 200, body: toPage(items.map(i => i.toJSON()), page, limit, total) };
  }
}
