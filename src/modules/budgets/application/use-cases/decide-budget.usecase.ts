import { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { BudgetVehiclePartPort, ServiceOrderPort, ServiceOrderHistoryPort, VehiclePartStockPort } from '../../domain/ports/external-services.ports';
import { FindBudgetByIdUseCase } from './find-budget-by-id.usecase';

export class DecideBudgetUseCase {
  constructor(
    private repo: BudgetRepositoryPort,
    private bvp: BudgetVehiclePartPort,
    private serviceOrder: ServiceOrderPort,
    private history: ServiceOrderHistoryPort,
    private parts: VehiclePartStockPort,
    private findById: FindBudgetByIdUseCase,
    private withTransaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
  ) {}

  async execute(budgetId: number, accept: boolean, user: { id: number }) {
    return this.withTransaction(async (tx) => {
      const budget = await this.findById.execute(budgetId, false);
      if (budget.ownerId !== user.id) {
        const err: any = new Error('Você não está autorizado a decidir esse orçamento.');
        err.status = 403;
        throw err;
      }

      const order = await this.serviceOrder.findActiveByBudgetId(budgetId, tx);
      if (!order) {
        const err: any = new Error('Ordem de serviço relacionada não encontrada.');
        err.status = 404;
        throw err;
      }
      if (order.customerId !== user.id) {
        const err: any = new Error('Você não está autorizado a modificar essa OS.');
        err.status = 403;
        throw err;
      }

      const oldStatus = order.currentStatus;
      const newStatus = accept ? 'AGUARDANDO_INICIO' : 'RECUSADA';

      if (!accept) {
        const items = await this.bvp.findByBudgetId(budgetId, tx);
        for (const it of items) {
          const p = await this.parts.getOne(it.vehiclePartId);
          await this.parts.setQuantity(p.id, p.quantity + it.quantity, tx);
        }
      }

      const saved = await this.serviceOrder.setStatus(order.idServiceOrder, newStatus as any, tx);
      await this.history.log(order.idServiceOrder, user.id, oldStatus, newStatus, tx);
      return saved;
    });
  }
}
