export type BudgetVehiclePartItem = { id: number; quantity: number };

export class Budget {
  constructor(
    public readonly id: number,
    public description: string,
    public deletedAt: Date | null,
    public creationDate: Date,
    public ownerId: number,
    public diagnosisId: number,
    public total: number,
    public vehicleParts: BudgetVehiclePartItem[]
  ) {}
}
