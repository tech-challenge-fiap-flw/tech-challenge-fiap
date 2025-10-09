import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { VehiclePartMySqlRepository } from '../../infra/VehiclePartMySqlRepository';

export class GetVehiclePartController implements IController {
  constructor(private readonly repo: VehiclePartMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);

    if (!found) {
      throw notFound('Vehicle part not found');
    }

    return {
      status: 200,
      body: found.toJSON()
    };
  }
}
