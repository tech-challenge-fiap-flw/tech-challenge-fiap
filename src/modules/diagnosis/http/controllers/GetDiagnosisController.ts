import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { DiagnosisMySqlRepository } from '../../infra/DiagnosisMySqlRepository';

export class GetDiagnosisController implements IController {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.repo.findById(id);
    if (!found) throw notFound('Diagnosis not found');
    return { status: 200, body: found.toJSON() };
  }
}
