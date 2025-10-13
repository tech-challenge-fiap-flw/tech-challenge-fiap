export type ServiceOrderHistoryId = string; // Mongo ObjectId as string

export interface IServiceOrderHistoryProps {
  id?: ServiceOrderHistoryId;
  idServiceOrder: number;
  userId: number;
  oldStatus?: string | null;
  newStatus: string;
  changedAt: Date;
  createdAt?: Date; // optional audit fields if needed
  updatedAt?: Date;
}

export class ServiceOrderHistoryEntity {
  private constructor(private readonly props: IServiceOrderHistoryProps) {}

  static create(input: Omit<IServiceOrderHistoryProps, 'id' | 'changedAt' | 'createdAt' | 'updatedAt'>) {
    if (!input.idServiceOrder || input.idServiceOrder <= 0) {
      throw new (require('../../../shared/domain/DomainException').DomainException)('idServiceOrder must be positive');
    }
    if (!input.userId || input.userId <= 0) {
      throw new (require('../../../shared/domain/DomainException').DomainException)('userId must be positive');
    }
    if (!input.newStatus || input.newStatus.trim().length === 0) {
      throw new (require('../../../shared/domain/DomainException').DomainException)('newStatus is required');
    }
    return new ServiceOrderHistoryEntity({ ...input, changedAt: new Date() });
  }

  static restore(props: IServiceOrderHistoryProps) {
    return new ServiceOrderHistoryEntity(props);
  }

  toJSON(): IServiceOrderHistoryProps {
    return { ...this.props };
  }
}
