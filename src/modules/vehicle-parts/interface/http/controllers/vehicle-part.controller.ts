import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { CreateVehiclePartDto } from '../dto/create-vehicle-part.dto';
import { UpdateVehiclePartDto } from '../dto/update-vehicle-part.dto';
import { PrismaVehiclePartRepository } from '../../../infrastructure/persistence/prisma/vehicle-part.repository.adapter';
import { CreateVehiclePartUseCase } from '../../../application/use-cases/create-vehicle-part.usecase';
import { FindVehiclePartsByNameUseCase } from '../../../application/use-cases/find-vehicle-parts-by-name.usecase';
import { VehiclePartPresenter } from '../../presenters/vehicle-part.presenter';
import { FindVehiclePartByIdUseCase } from '../../../application/use-cases/find-vehicle-part-by-id.usecase';
import { UpdateVehiclePartUseCase } from '../../../application/use-cases/update-vehicle-part.usecase';
import { RemoveVehiclePartUseCase } from '../../../application/use-cases/remove-vehicle-part.usecase';

const repo = new PrismaVehiclePartRepository();
const ensureUC = new FindVehiclePartByIdUseCase(repo);

export class VehiclePartController {
  static async create(req: HttpRequest<CreateVehiclePartDto>): Promise<HttpResponse> {
    const uc = new CreateVehiclePartUseCase(repo);
    const part = await uc.execute(req.body);
    return { status: 201, body: VehiclePartPresenter.toResponse(part) };
  }

  static async findByNameLike(req: HttpRequest<unknown, unknown, { name?: string }>): Promise<HttpResponse> {
    const name = String(req.query?.name || '').trim();

    if (!name) {
      return { status: 400, body: { message: 'Query param "name" is required' } };
    }

    const uc = new FindVehiclePartsByNameUseCase(repo);
    const list = await uc.execute(name);
    return { status: 200, body: list.map(VehiclePartPresenter.toResponse) };
  }

  static async update(req: HttpRequest<UpdateVehiclePartDto, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new UpdateVehiclePartUseCase(repo, (i) => ensureUC.execute(i));
    const updated = await uc.execute(id, req.body);
    return { status: 200, body: VehiclePartPresenter.toResponse(updated) };
  }

  static async remove(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new RemoveVehiclePartUseCase(repo, (i) => ensureUC.execute(i));
    await uc.execute(id);
    return { status: 204 };
  }
}
