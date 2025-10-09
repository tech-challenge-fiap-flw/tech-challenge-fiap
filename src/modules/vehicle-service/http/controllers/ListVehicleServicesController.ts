import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { VehicleServiceMySqlRepository } from '../../infra/VehicleServiceMySqlRepository';
import { getPagination, toPage } from '../../../../shared/http/pagination';

export class ListVehicleServicesController implements IController {
  constructor(private readonly repo: VehicleServiceMySqlRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);
    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll()
    ]);
    return { status: 200, body: toPage(items.map(i => i.toJSON()), page, limit, total) };
  }
}
