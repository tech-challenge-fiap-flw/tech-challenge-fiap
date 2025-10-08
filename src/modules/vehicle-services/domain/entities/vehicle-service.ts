export class VehicleServiceEntity {
  constructor(
    public readonly id: number,
    public name: string,
    public price: number,
    public description: string | null,
    public deletedAt: Date | null
  ) {}
}
