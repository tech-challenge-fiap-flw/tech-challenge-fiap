import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { VehiclePartMySqlRepository } from '../../infra/VehiclePartMySqlRepository';

export class DeleteVehiclePartController implements IController {
  constructor(private readonly repo: VehiclePartMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.repo.softDelete(id);

    return {
      status: 204
    };
  }
}
