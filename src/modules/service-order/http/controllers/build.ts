import { ServiceOrderMySqlRepository } from '../../infra/ServiceOrderMySqlRepository';
import { ServiceOrderHistoryMongoRepository } from '../../../service-order-history/infra/ServiceOrderHistoryMongoRepository';
import { ServiceOrderService } from '../../application/ServiceOrderService';

export function buildServiceOrderService() {
  const repo = new ServiceOrderMySqlRepository();
  const history = new ServiceOrderHistoryMongoRepository();
  return { service: new ServiceOrderService(repo, history), repo };
}
