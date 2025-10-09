import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { BudgetMySqlRepository } from '../../infra/BudgetMySqlRepositories';
import { getPagination, toPage } from '../../../../shared/http/pagination';

export class ListBudgetsController implements IController {
  constructor(private readonly repo: BudgetMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);
    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll(),
    ]);
    return { status: 200, body: toPage(items.map(i => i.toJSON()), page, limit, total) };
  }
}
