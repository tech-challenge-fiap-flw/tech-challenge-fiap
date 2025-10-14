import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IBudgetVehicleServiceService } from '../../application/BudgetVehicleServiceService';

export class GetBudgetVehicleServiceController implements IController {
  constructor(private readonly service: IBudgetVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const user = await this.service.findById(id);

    return {
      status: 200,
      body: user
    };
  }
}
