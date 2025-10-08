import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclePresenter } from '../../presenters/vehicle.presenter';
import { PrismaVehicleRepository } from '../../../infrastructure/persistence/prisma/vehicle.repository.adapter';
import { CreateVehicleUseCase } from '../../../application/use-cases/create-vehicle.usecase';
import { FindAllVehiclesUseCase } from '../../../application/use-cases/find-all-vehicles.usecase';
import { FindVehicleByIdUseCase } from '../../../application/use-cases/find-vehicle-by-id.usecase';
import { UpdateVehicleUseCase } from '../../../application/use-cases/update-vehicle.usecase';
import { RemoveVehicleUseCase } from '../../../application/use-cases/remove-vehicle.usecase';

const repo = new PrismaVehicleRepository();
const findByIdUC = new FindVehicleByIdUseCase(repo);

export class VehicleController {
  static async create(req: HttpRequest<CreateVehicleDto>): Promise<HttpResponse> {
    const user = req.user!;
    const uc = new CreateVehicleUseCase(repo);
    const vehicle = await uc.execute(user, req.body);
    return { status: 201, body: VehiclePresenter.toResponse(vehicle) };
  }

  static async findAll(req: HttpRequest): Promise<HttpResponse> {
    const user = req.user!;
    const uc = new FindAllVehiclesUseCase(repo);
    const list = await uc.execute(user);
    return { status: 200, body: list.map(VehiclePresenter.toResponse) };
  }

  static async findOne(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const user = req.user!;
    const id = Number(req.params.id);
    const v = await findByIdUC.execute(id, user);
    return { status: 200, body: VehiclePresenter.toResponse(v) };
  }

  static async update(req: HttpRequest<UpdateVehicleDto, { id: string }>): Promise<HttpResponse> {
    const user = req.user!;
    const id = Number(req.params.id);
    const uc = new UpdateVehicleUseCase(repo, (i, u) => findByIdUC.execute(i, u));
    const v = await uc.execute(user, id, req.body);
    return { status: 200, body: VehiclePresenter.toResponse(v) };
  }

  static async remove(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const user = req.user!;
    const id = Number(req.params.id);
    const uc = new RemoveVehicleUseCase(repo, (i, u) => findByIdUC.execute(i, u));
    await uc.execute(user, id);
    return { status: 204 };
  }
}
