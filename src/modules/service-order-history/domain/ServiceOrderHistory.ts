export interface ServiceOrderHistoryProps {
  id?: string;
  idServiceOrder: number;
  userId: number;
  oldStatus?: string | null;
  newStatus: string;
  changedAt: Date;
}

export class ServiceOrderHistoryEntity {
  private props: ServiceOrderHistoryProps;
  private constructor(props: ServiceOrderHistoryProps) { this.props = props; }
  static create(input: Omit<ServiceOrderHistoryProps, 'id' | 'changedAt'>) {
    return new ServiceOrderHistoryEntity({ ...input, changedAt: new Date() });
  }
  static restore(props: ServiceOrderHistoryProps) { return new ServiceOrderHistoryEntity(props); }
  toJSON(): ServiceOrderHistoryProps { return { ...this.props }; }
}
