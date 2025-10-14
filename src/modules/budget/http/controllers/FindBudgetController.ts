import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller'
import { IBudgetService } from '../../application/BudgetService'

export class FindBudgetController implements IController {
  constructor(private readonly service: IBudgetService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const { id } = req.params

    const budget = await this.service.findById(id)

    return {
      status: 200,
      body: budget
    }
  }
}
