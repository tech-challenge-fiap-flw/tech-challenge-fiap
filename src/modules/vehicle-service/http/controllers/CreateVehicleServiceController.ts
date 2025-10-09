import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { VehicleServiceMySqlRepository } from '../../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../../domain/VehicleService';
import { createVehicleServiceSchema } from './schemas';

export class CreateVehicleServiceController implements IController {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehicleServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const entity = VehicleServiceEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);

    return { status: 201, body: created.toJSON() };
  }
}
