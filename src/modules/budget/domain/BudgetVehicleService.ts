export type BudgetVehicleServiceId = number;

export interface BudgetVehicleServiceProps {
  id?: BudgetVehicleServiceId;
  budgetId: number;
  vehicleServiceId: number;
  price: number; // snapshot price
}

export class BudgetVehicleServiceEntity {
  private props: BudgetVehicleServiceProps;
  private constructor(props: BudgetVehicleServiceProps) { this.props = props; }
  static create(input: Omit<BudgetVehicleServiceProps, 'id'>) { return new BudgetVehicleServiceEntity(input); }
  static restore(props: BudgetVehicleServiceProps) { return new BudgetVehicleServiceEntity(props); }
  toJSON(): BudgetVehicleServiceProps { return { ...this.props }; }
}
