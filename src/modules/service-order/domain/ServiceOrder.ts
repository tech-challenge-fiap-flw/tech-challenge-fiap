export type ServiceOrderId = number;

export type ServiceOrderStatus =
  | 'CREATED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceOrderProps {
  id?: ServiceOrderId;
  description: string;
  creationDate: Date;
  currentStatus: ServiceOrderStatus;
  budgetId?: number | null;
  customerId: number;
  mechanicId?: number | null;
  vehicleId: number;
  active: boolean;
}

export class ServiceOrderEntity {
  private props: ServiceOrderProps;
  private constructor(props: ServiceOrderProps) { this.props = props; }
  static create(input: Omit<ServiceOrderProps, 'id' | 'creationDate' | 'currentStatus' | 'active'>) {
    return new ServiceOrderEntity({ ...input, creationDate: new Date(), currentStatus: 'CREATED', active: true });
  }
  static restore(props: ServiceOrderProps) { return new ServiceOrderEntity(props); }
  toJSON(): ServiceOrderProps { return { ...this.props }; }
}
