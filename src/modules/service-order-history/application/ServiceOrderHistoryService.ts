import { IServiceOrderHistoryRepository } from '../domain/IServiceOrderHistoryRepository';
import { ServiceOrderHistoryEntity } from '../domain/ServiceOrderHistory';

export interface LogStatusChangeInput {
  idServiceOrder: number;
  userId: number;
  oldStatus?: string | null;
  newStatus: string;
}

export type ServiceOrderHistoryOutput = ReturnType<ServiceOrderHistoryEntity['toJSON']>;

export interface IServiceOrderHistoryService {
  logStatusChange(input: LogStatusChangeInput): Promise<ServiceOrderHistoryOutput>;
  listByServiceOrder(idServiceOrder: number): Promise<ServiceOrderHistoryOutput[]>;
}

export class ServiceOrderHistoryService implements IServiceOrderHistoryService {
  constructor(private readonly repo: IServiceOrderHistoryRepository) {}

  async logStatusChange(input: LogStatusChangeInput): Promise<ServiceOrderHistoryOutput> {
    const entity = ServiceOrderHistoryEntity.create(input);
    const saved = await this.repo.log(entity);
    return saved.toJSON();
  }

  async listByServiceOrder(idServiceOrder: number): Promise<ServiceOrderHistoryOutput[]> {
    const items = await this.repo.listByServiceOrder(idServiceOrder);
    return items.map(i => i.toJSON());
  }
}
