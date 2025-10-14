import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IServiceOrderService } from '../../application/ServiceOrderService';

export class GetServiceOrderController implements IController {
  constructor(private readonly service: IServiceOrderService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    if (!req.params.id) {
      throw badRequest('ID is required');
    }

    const created = await this.service.findById(req.params.id);

    return {
      status: 200,
      body: created
    };
  }
}
