export class VehiclePart {
  constructor(
    public readonly id: number,
    public type: string,
    public name: string,
    public description: string,
    public quantity: number,
    public price: number,
    public deletedAt: Date | null,
    public creationDate: Date
  ) {}
}
