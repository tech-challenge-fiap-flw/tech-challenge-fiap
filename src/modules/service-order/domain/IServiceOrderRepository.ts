import { IBaseRepository } from '../../../shared/domain/BaseRepository';
import { IServiceOrderProps, ServiceOrderEntity, ServiceOrderId } from './ServiceOrder';

export interface IServiceOrderRepository extends IBaseRepository {
  create(entity: ServiceOrderEntity): Promise<ServiceOrderEntity>;
  findById(id: ServiceOrderId): Promise<ServiceOrderEntity | null>;
  update(id: ServiceOrderId, partial: Partial<IServiceOrderProps>): Promise<ServiceOrderEntity | null>;
}
