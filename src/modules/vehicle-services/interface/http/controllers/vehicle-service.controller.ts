import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { CreateVehicleServiceDto } from '../dto/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update-vehicle-service.dto';
import { PrismaVehicleServiceRepository } from '../../../infrastructure/persistence/prisma/vehicle-service.repository.adapter';
import { CreateVehicleServiceUseCase } from '../../../application/use-cases/create-vehicle-service.usecase';
import { FindAllVehicleServicesUseCase } from '../../../application/use-cases/find-all-vehicle-services.usecase';
import { FindVehicleServiceByIdUseCase } from '../../../application/use-cases/find-vehicle-service-by-id.usecase';
import { UpdateVehicleServiceUseCase } from '../../../application/use-cases/update-vehicle-service.usecase';
import { RemoveVehicleServiceUseCase } from '../../../application/use-cases/remove-vehicle-service.usecase';
import { VehicleServicePresenter } from '../../presenters/vehicle-service.presenter';

const repo = new PrismaVehicleServiceRepository();
const ensureUC = new FindVehicleServiceByIdUseCase(repo);

export class VehicleServiceController {
  static async create(req: HttpRequest<CreateVehicleServiceDto>): Promise<HttpResponse> {
    const uc = new CreateVehicleServiceUseCase(repo);
    const created = await uc.execute(req.body);
    return { status: 201, body: VehicleServicePresenter.toResponse(created) };
  }

  static async findAll(_req: HttpRequest): Promise<HttpResponse> {
    const uc = new FindAllVehicleServicesUseCase(repo);
    const list = await uc.execute();
    return { status: 200, body: list.map(VehicleServicePresenter.toResponse) };
  }

  static async findOne(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new FindVehicleServiceByIdUseCase(repo);
    const item = await uc.execute(id);
    return { status: 200, body: VehicleServicePresenter.toResponse(item) };
  }

  static async update(req: HttpRequest<UpdateVehicleServiceDto, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new UpdateVehicleServiceUseCase(repo, (i) => ensureUC.execute(i));
    const updated = await uc.execute(id, req.body);
    return { status: 200, body: VehicleServicePresenter.toResponse(updated) };
  }

  static async remove(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new RemoveVehicleServiceUseCase(repo, (i) => ensureUC.execute(i));
    await uc.execute(id);
    return { status: 204 };
  }
}
