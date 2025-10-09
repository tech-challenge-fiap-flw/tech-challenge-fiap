import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { ServiceOrderService } from '../../application/ServiceOrderService';

export class AssignMechanicController implements IController {
  constructor(private readonly service: ServiceOrderService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const mechanicId = Number(req.params.mechanicId);
    const updated = await this.service.assignMechanic(id, mechanicId);
    return { status: 200, body: updated };
  }
}
