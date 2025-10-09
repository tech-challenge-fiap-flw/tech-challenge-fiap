import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { VehiclePartMySqlRepository } from '../../infra/VehiclePartMySqlRepository';
import { VehiclePartEntity } from '../../domain/VehiclePart';
import { createVehiclePartSchema } from './schemas';

export class CreateVehiclePartController implements IController {
  constructor(private readonly repo: VehiclePartMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehiclePartSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const entity = VehiclePartEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);

    return {
      status: 201,
      body: created.toJSON()
    };
  }
}
