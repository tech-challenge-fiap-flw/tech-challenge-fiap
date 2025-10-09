import { ObjectId } from 'mongodb';
import { getCollection } from '../../../infra/mongo/mongo';
import { ServiceOrderHistoryEntity, ServiceOrderHistoryProps } from '../domain/ServiceOrderHistory';
import { ServiceOrderHistoryRepository } from '../domain/ServiceOrderHistoryRepository';
interface ServiceOrderHistoryMongoProps extends ServiceOrderHistoryProps {
  _id?: ObjectId;
}

export class ServiceOrderHistoryMongoRepository implements ServiceOrderHistoryRepository {
  private collectionName = 'service_order_history';

  async create(entry: ServiceOrderHistoryEntity): Promise<ServiceOrderHistoryEntity> {
    const data = entry.toJSON();
    
    const { id, ...dataToInsert } = data; 
    
    const col = await getCollection<ServiceOrderHistoryMongoProps>(this.collectionName);
    
    const { insertedId } = await col.insertOne({ 
      ...dataToInsert, 
      changedAt: new Date() 
    });
    
    return ServiceOrderHistoryEntity.restore({ ...data, id: insertedId.toString() });
  }

  async findByServiceOrder(idServiceOrder: number): Promise<ServiceOrderHistoryEntity[]> {
    const col = await getCollection<ServiceOrderHistoryMongoProps>(this.collectionName);
    
    const items = await col
      .find({ idServiceOrder: idServiceOrder })
      .sort({ changedAt: -1 })
      .toArray();
      
    return items.map((doc) => {
      const id = doc._id?.toString();
      const { _id, ...rest } = doc; 
      
      return ServiceOrderHistoryEntity.restore({ ...rest, id: id });
    });
  }
}