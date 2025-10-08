export class Vehicle {
  constructor(
    public readonly id: number,
    public idPlate: string,
    public type: string,
    public model: string,
    public brand: string,
    public manufactureYear: number,
    public modelYear: number,
    public color: string,
    public ownerId: number,
    public deletedAt: Date | null
  ) {}
}
