import { ServiceOrderEntity, ServiceOrderId, ServiceOrderProps, ServiceOrderStatus } from './ServiceOrder';

export interface ServiceOrderRepository {
  create(entity: ServiceOrderEntity): Promise<ServiceOrderEntity>;
  findById(id: ServiceOrderId): Promise<ServiceOrderEntity | null>;
  updateStatus(id: ServiceOrderId, newStatus: ServiceOrderStatus): Promise<ServiceOrderEntity>;
  assignMechanic(id: ServiceOrderId, mechanicId: number): Promise<ServiceOrderEntity>;
  softDelete(id: ServiceOrderId): Promise<void>;
  list(offset: number, limit: number): Promise<ServiceOrderEntity[]>;
  countAll(): Promise<number>;
}
