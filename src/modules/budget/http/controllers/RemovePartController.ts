import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { BudgetService } from '../../application/BudgetService';

export class RemovePartController implements IController {
  constructor(private readonly service: BudgetService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const entryId = Number(req.params.entryId);
    await this.service.removePart(entryId, id);
    return { status: 204 };
  }
}
