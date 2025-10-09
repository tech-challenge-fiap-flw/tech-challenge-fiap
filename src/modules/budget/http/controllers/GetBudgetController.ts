import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { BudgetMySqlRepository } from '../../infra/BudgetMySqlRepositories';

export class GetBudgetController implements IController {
  constructor(private readonly repo: BudgetMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const budget = await this.repo.findById(id);
    if (!budget) throw notFound('Budget not found');
    return { status: 200, body: budget.toJSON() };
  }
}
