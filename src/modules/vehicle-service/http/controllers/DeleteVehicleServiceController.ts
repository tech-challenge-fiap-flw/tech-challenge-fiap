import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { VehicleServiceMySqlRepository } from '../../infra/VehicleServiceMySqlRepository';

export class DeleteVehicleServiceController implements IController {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    await this.repo.softDelete(id);
    return { status: 204 };
  }
}
