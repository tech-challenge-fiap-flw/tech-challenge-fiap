import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { VehicleMySqlRepository } from '../../infra/VehicleMySqlRepository';

export class GetVehicleController implements IController {
  constructor(private readonly repo: VehicleMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);
    if (!found) throw notFound('Vehicle not found');
    return { status: 200, body: found.toJSON() };
  }
}
