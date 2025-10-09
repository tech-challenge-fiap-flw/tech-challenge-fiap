import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { ServiceOrderService } from '../../application/ServiceOrderService';
import { ServiceOrderStatus } from '../../domain/ServiceOrder';
import { changeStatusSchema } from './schemas';

export class ChangeStatusController implements IController {
  constructor(private readonly service: ServiceOrderService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = changeStatusSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    const userId = req.user?.sub;
    const updated = await this.service.changeStatus(id, parsed.data.status as ServiceOrderStatus, userId);
    return { status: 200, body: updated };
  }
}
