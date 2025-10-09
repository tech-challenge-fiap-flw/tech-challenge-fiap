import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { VehicleService } from '../../application/VehicleService';

export class DeleteVehicleController implements IController {
  constructor(private readonly service: VehicleService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    await this.service.deleteVehicle(id);
    return { status: 204 };
  }
}
