import { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { VehicleServiceQueryPort, BudgetVehiclePartPort, BudgetVehicleServicePort } from '../../domain/ports/external-services.ports';
import { FindBudgetByIdUseCase } from './find-budget-by-id.usecase';

type Input = {
  description?: string;
  vehicleParts: { id: number; quantity: number }[];
  vehicleServicesIds?: number[];
};

export class UpdateBudgetUseCase {
  constructor(
    private repo: BudgetRepositoryPort,
    private bvp: BudgetVehiclePartPort,
    private bvs: BudgetVehicleServicePort,
    private services: VehicleServiceQueryPort,
    private findById: FindBudgetByIdUseCase,
    private withTransaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
  ) {}

  async execute(id: number, dto: Input) {
    await this.withTransaction(async (tx) => {
      const budget = await this.findById.execute(id, true);

      // services
      if (dto.vehicleServicesIds) {
        const found = await this.services.findByIds(dto.vehicleServicesIds);
        if (found.length !== dto.vehicleServicesIds.length) {
          const err: any = new Error('Um ou mais serviços não foram encontrados para atualização');
          err.status = 404;
          throw err;
        }
        await this.bvs.replace(id, dto.vehicleServicesIds, tx);
      }

      // parts diff
      const current = new Map(budget.vehicleParts.map(vp => [vp.id, vp.quantity]));
      const desired = new Map(dto.vehicleParts.map(vp => [vp.id, vp.quantity]));

      const toRemove: { id: number }[] = [];
      const toUpdate: { id: number; vehiclePartId: number; quantity: number }[] = [];
      const toAdd: { id: number; quantity: number }[] = [];

      for (const [partId, qty] of current.entries()) {
        if (!desired.has(partId)) {
          toRemove.push({ id: partId });
        } else if (desired.get(partId)! !== qty) {
          toUpdate.push({ id: 0 /* será mapeado no adapter */, vehiclePartId: partId, quantity: desired.get(partId)! });
        }
      }
      for (const [partId, qty] of desired.entries()) {
        if (!current.has(partId)) {
          toAdd.push({ id: partId, quantity: qty });
        }
      }

      if (dto.description !== undefined) {
        await this.repo.updateCore(id, { description: dto.description });
      }

      if (toRemove.length) await this.bvp.remove(toRemove, tx);
      if (toUpdate.length) await this.bvp.updateMany(toUpdate, tx);
      if (toAdd.length) await this.bvp.create(id, toAdd, tx);
    });

    return this.findById.execute(id, true);
  }
}
