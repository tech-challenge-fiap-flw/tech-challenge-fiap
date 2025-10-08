export type BudgetId = number;

export interface BudgetProps {
  id?: BudgetId;
  description: string;
  ownerId: number;
  diagnosisId: number;
  total: number;
  creationDate?: Date | null;
  deletedAt?: Date | null;
}

export class BudgetEntity {
  private props: BudgetProps;
  private constructor(props: BudgetProps) { this.props = props; }
  static create(input: Omit<BudgetProps, 'id' | 'total' | 'creationDate' | 'deletedAt'>) {
    return new BudgetEntity({ ...input, total: 0, creationDate: new Date(), deletedAt: null });
  }
  static restore(props: BudgetProps) { return new BudgetEntity(props); }
  toJSON(): BudgetProps { return { ...this.props }; }
}
