export class Diagnosis {
  constructor(
    public readonly id: number,
    public description: string,
    public creationDate: Date,
    public vehicleId: number,
    public responsibleMechanicId: number | null,
    public deletedAt: Date | null
  ) {}
}
