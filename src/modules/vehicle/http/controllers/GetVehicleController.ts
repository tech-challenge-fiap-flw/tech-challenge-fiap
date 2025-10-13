import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IVehicleService } from '../../application/VehicleService';

export class GetVehicleController implements IController {
  constructor(private readonly service: IVehicleService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const found = await this.service.findById(id);

    return {
      status: 200,
      body: found
    };
  }
}
