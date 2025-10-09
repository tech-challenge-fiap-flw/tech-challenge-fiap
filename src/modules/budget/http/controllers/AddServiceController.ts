import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { BudgetService } from '../../application/BudgetService';
import { addServiceSchema } from './schemas';

export class AddServiceController implements IController {
  constructor(private readonly service: BudgetService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = addServiceSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    await this.service.addService(id, parsed.data.vehicleServiceId, parsed.data.price);
    return { status: 204 };
  }
}
