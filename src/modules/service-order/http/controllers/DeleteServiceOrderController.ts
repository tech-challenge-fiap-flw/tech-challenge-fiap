import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { ServiceOrderService } from '../../application/ServiceOrderService';

export class DeleteServiceOrderController implements IController {
  constructor(private readonly service: ServiceOrderService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    await this.service.delete(id);
    return { status: 204 };
  }
}
