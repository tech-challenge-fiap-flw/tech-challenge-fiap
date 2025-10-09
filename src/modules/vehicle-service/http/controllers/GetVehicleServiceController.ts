import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { VehicleServiceMySqlRepository } from '../../infra/VehicleServiceMySqlRepository';

export class GetVehicleServiceController implements IController {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);
    if (!found) {
      throw notFound('Vehicle service not found');
    }
    return { status: 200, body: found.toJSON() };
  }
}
