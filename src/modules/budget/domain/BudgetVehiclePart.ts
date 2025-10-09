export type BudgetVehiclePartId = number;

export interface BudgetVehiclePartProps {
  id?: BudgetVehiclePartId;
  budgetId: number;
  vehiclePartId: number;
  quantity: number;
  price: number;
}

export class BudgetVehiclePartEntity {
  private props: BudgetVehiclePartProps;
  private constructor(props: BudgetVehiclePartProps) { this.props = props; }
  static create(input: Omit<BudgetVehiclePartProps, 'id'>) { return new BudgetVehiclePartEntity(input); }
  static restore(props: BudgetVehiclePartProps) { return new BudgetVehiclePartEntity(props); }
  toJSON(): BudgetVehiclePartProps { return { ...this.props }; }
}
