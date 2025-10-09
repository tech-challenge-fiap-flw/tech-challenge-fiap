import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { BudgetService } from '../../application/BudgetService';
import { createBudgetSchema } from './schemas';

export class CreateBudgetController implements IController {
  constructor(private readonly service: BudgetService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createBudgetSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    const created = await this.service.createBudget(parsed.data as any);
    return { status: 201, body: created };
  }
}
