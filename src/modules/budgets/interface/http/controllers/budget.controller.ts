import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { BudgetPresenter } from '../../presenters/budget.presenter';
import { CreateBudgetDto } from '../dto/create-budget.dto';

export class BudgetController {
  static async create(req: HttpRequest<CreateBudgetDto>): Promise<HttpResponse> {
    const teste: any = {}
    return Promise.resolve(teste);
    // await validate(CreateBudgetDto, req.body);
    // const created = await budgetService.create(req.body);
    // return { status: 201, body: BudgetPresenter.toResponse(created) };
  }

  // static async update(req: HttpRequest<UpdateBudgetDto, { id: string }>): Promise<HttpResponse> {
  //   await validate(UpdateBudgetDto, req.body);
  //   const id = Number(req.params.id);
  //   const updated = await budgetService.update(id, req.body);
  //   return { status: 200, body: BudgetPresenter.toResponse(updated) };
  // }

  // static async findOne(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
  //   const id = Number(req.params.id);
  //   const user = req.user ?? null;
  //   const budget = await budgetService.findById(id, ['vehicleParts'], null, user);
  //   return { status: 200, body: BudgetPresenter.toResponse(budget) };
  // }

  // static async remove(req: HttpRequest<unknown, { id: string }>): Promise<HttpResponse> {
  //   const id = Number(req.params.id);
  //   await budgetService.remove(id);
  //   return { status: 204 };
  // }

  // static async decideBudget(
  //   req: HttpRequest<AcceptBudgetDto, { id: string }>
  // ): Promise<HttpResponse> {
  //   await validate(AcceptBudgetDto, req.body);
  //   const id = Number(req.params.id);
  //   const user = req.user!;
  //   const result = await budgetService.decideBudget(id, req.body.accept, user);
  //   return { status: 200, body: { success: true, orderId: result.idServiceOrder, status: result.currentStatus } };
  // }
}
