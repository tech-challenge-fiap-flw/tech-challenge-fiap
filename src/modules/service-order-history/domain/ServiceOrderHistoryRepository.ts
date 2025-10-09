import { ServiceOrderHistoryEntity, ServiceOrderHistoryProps } from './ServiceOrderHistory';

export interface ServiceOrderHistoryRepository {
  create(entry: ServiceOrderHistoryEntity): Promise<ServiceOrderHistoryEntity>;
  findByServiceOrder(idServiceOrder: number): Promise<ServiceOrderHistoryEntity[]>;
}
