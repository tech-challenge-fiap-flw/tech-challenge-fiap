import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { DiagnosisMySqlRepository } from '../../infra/DiagnosisMySqlRepository';
import { DiagnosisEntity } from '../../domain/Diagnosis';
import { createDiagnosisSchema } from './schemas';

export class CreateDiagnosisController implements IController {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createDiagnosisSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Validation failed', parsed.error.format());
    const entity = DiagnosisEntity.create(parsed.data as any);
    const created = await this.repo.create(entity);
    return { status: 201, body: created.toJSON() };
  }
}
