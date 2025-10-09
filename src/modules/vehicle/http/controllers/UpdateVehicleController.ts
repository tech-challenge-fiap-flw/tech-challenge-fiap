import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { VehicleService } from '../../application/VehicleService';
import { updateVehicleSchema } from './schemas';

export class UpdateVehicleController implements IController {
  constructor(private readonly service: VehicleService) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = updateVehicleSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    const updated = await this.service.updateVehicle(id, parsed.data as any);
    return { status: 200, body: updated };
  }
}
