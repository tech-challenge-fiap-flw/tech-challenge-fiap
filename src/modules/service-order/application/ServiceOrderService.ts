import { ServiceOrderEntity, ServiceOrderId, ServiceOrderStatus } from '../domain/ServiceOrder';
import { ServiceOrderRepository } from '../domain/ServiceOrderRepository';
import { ServiceOrderHistoryMongoRepository } from '../../service-order-history/infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderHistoryEntity } from '../../service-order-history/domain/ServiceOrderHistory';

export class ServiceOrderService {
  constructor(
    private readonly repo: ServiceOrderRepository,
    private readonly historyRepo: ServiceOrderHistoryMongoRepository
  ) {}

  async create(
    input: Omit<ReturnType<ServiceOrderEntity['toJSON']>, 'id' | 'creationDate' | 'currentStatus' | 'active'>
  ) {
    const entity = ServiceOrderEntity.create(input as any);
    const created = await this.repo.create(entity);

    return created.toJSON();
  }

  async changeStatus(id: ServiceOrderId, newStatus: ServiceOrderStatus, userId: number) {
    const current = await this.repo.findById(id);

    if (!current) {
      throw Object.assign(new Error('Service order not found'), { status: 404 });
    }

    const before = current.toJSON().currentStatus;
    const updated = await this.repo.updateStatus(id, newStatus);

    await this.historyRepo.create(
      ServiceOrderHistoryEntity.create({
        idServiceOrder: id,
        userId,
        oldStatus: before,
        newStatus
      })
    );

    return updated.toJSON();
  }

  async assignMechanic(id: ServiceOrderId, mechanicId: number) {
    const updated = await this.repo.assignMechanic(id, mechanicId);

    return updated.toJSON();
  }

  async delete(id: ServiceOrderId) {
    await this.repo.softDelete(id);
  }
}
