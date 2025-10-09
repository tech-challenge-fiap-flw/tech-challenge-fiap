import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { DiagnosisMySqlRepository } from '../../infra/DiagnosisMySqlRepository';

export class DeleteDiagnosisController implements IController {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    await this.repo.softDelete(id);
    return { status: 204 };
  }
}
