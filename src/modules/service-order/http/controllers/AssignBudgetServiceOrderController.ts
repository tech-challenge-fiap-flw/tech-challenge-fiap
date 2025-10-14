import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IServiceOrderService } from '../../application/ServiceOrderService';
import { assignBudgetSchema } from './scremas';

export class AssignBudgetServiceOrderController implements IController {
  constructor(private readonly service: IServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = assignBudgetSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    if (!req.user) {
      throw badRequest('Unauthorized');
    }

    const updated = await this.service.assignBudget(req.user, Number(req.params.id), parsed.data);

    return {
      status: 200,
      body: updated
    };
  }
}
