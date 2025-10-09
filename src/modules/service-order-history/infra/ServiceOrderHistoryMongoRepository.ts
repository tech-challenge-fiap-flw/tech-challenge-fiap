import { getCollection } from '../../../infra/mongo/mongo';
import { ServiceOrderHistoryEntity, ServiceOrderHistoryProps } from '../domain/ServiceOrderHistory';
import { ServiceOrderHistoryRepository } from '../domain/ServiceOrderHistoryRepository';

export class ServiceOrderHistoryMongoRepository implements ServiceOrderHistoryRepository {
  private collectionName = 'service_order_history';

  async create(entry: ServiceOrderHistoryEntity): Promise<ServiceOrderHistoryEntity> {
    const data = entry.toJSON();
    const col = await getCollection<ServiceOrderHistoryProps>(this.collectionName);
    const { insertedId } = await col.insertOne({ ...data, changedAt: new Date() } as any);
    return ServiceOrderHistoryEntity.restore({ ...data, id: insertedId.toString() });
  }

  async findByServiceOrder(idServiceOrder: number): Promise<ServiceOrderHistoryEntity[]> {
    const col = await getCollection<ServiceOrderHistoryProps>(this.collectionName);
    const items = await col.find({ idServiceOrder } as any).sort({ changedAt: -1 }).toArray();
    return items.map((doc: any) => ServiceOrderHistoryEntity.restore({ ...doc, id: doc._id?.toString() }));
  }
}
