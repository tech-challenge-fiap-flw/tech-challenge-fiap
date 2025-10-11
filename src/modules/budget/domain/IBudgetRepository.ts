import { BudgetEntity, BudgetId, BudgetProps } from './Budget';
import { IBaseRepository } from '../../../shared/domain/BaseRepository'

export interface IBudgetRepository extends IBaseRepository {
  create(entity: BudgetEntity): Promise<BudgetEntity>;
}
