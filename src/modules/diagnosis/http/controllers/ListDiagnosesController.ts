import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { DiagnosisMySqlRepository } from '../../infra/DiagnosisMySqlRepository';
import { getPagination, toPage } from '../../../../shared/http/pagination';

export class ListDiagnosesController implements IController {
  constructor(private readonly repo: DiagnosisMySqlRepository) {}
  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { page, limit, offset } = getPagination(req.raw as any);
    const [items, total] = await Promise.all([
      this.repo.list(offset, limit),
      this.repo.countAll()
    ]);
    return { status: 200, body: toPage(items.map(i => i.toJSON()), page, limit, total) };
  }
}
