import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { BudgetService } from '../../application/BudgetService';
import { addPartSchema } from './schemas';

export class AddPartController implements IController {
  constructor(private readonly service: BudgetService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = addPartSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    await this.service.addPart(id, parsed.data.vehiclePartId, parsed.data.quantity, parsed.data.price);
    return { status: 204 };
  }
}
