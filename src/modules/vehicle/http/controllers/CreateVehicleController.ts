import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { VehicleService } from '../../application/VehicleService';
import { createVehicleSchema } from './schemas';

export class CreateVehicleController implements IController {
  constructor(private readonly service: VehicleService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehicleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const created = await this.service.createVehicle(parsed.data as any);

    return {
      status: 201,
      body: created
    };
  }
}
