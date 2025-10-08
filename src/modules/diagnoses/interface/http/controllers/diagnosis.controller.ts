import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { PrismaDiagnosisRepository } from '../../../infrastructure/persistence/prisma/diagnosis.repository.adapter';
import { PrismaVehicleRepository } from '../../../../vehicles/infrastructure/persistence/prisma/vehicle.repository.adapter';
import { PrismaUserRepository } from '../../../../users/infrastructure/persistence/prisma/user.repository.adapter';
import { CreateDiagnosisUseCase } from '../../../application/use-cases/create-diagnosis.usecase';
import { DiagnosisPresenter } from '../../presenters/diagnosis.presenter';
import { FindDiagnosisByIdUseCase } from '../../../application/use-cases/find-diagnosis-by-id.usecase';

const diagnosisRepo = new PrismaDiagnosisRepository();
const vehicleRepo = new PrismaVehicleRepository();
const userRepo = new PrismaUserRepository();

export class DiagnosisController {
  static async create(req: HttpRequest<CreateDiagnosisDto>): Promise<HttpResponse> {
    const uc = new CreateDiagnosisUseCase(diagnosisRepo, vehicleRepo, userRepo);
    const diag = await uc.execute(req.body);
    return { status: 201, body: DiagnosisPresenter.toResponse(diag) };
  }

  static async findOne(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const uc = new FindDiagnosisByIdUseCase(diagnosisRepo);
    const diag = await uc.execute(id);
    return { status: 200, body: DiagnosisPresenter.toResponse(diag) };
  }
}
