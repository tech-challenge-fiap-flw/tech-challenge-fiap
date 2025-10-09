import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { VehicleServiceMySqlRepository } from '../../infra/VehicleServiceMySqlRepository';
import { updateVehicleServiceSchema } from './schemas';

export class UpdateVehicleServiceController implements IController {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = updateVehicleServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }
    const updated = await this.repo.update(id, parsed.data as any);
    return { status: 200, body: updated.toJSON() };
  }
}
