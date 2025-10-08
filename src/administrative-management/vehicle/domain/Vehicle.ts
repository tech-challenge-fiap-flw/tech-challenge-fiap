export interface VehicleProps {
  id: number;
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId: number;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle {
  readonly id: number;
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;


  constructor(props: VehicleProps) {
    this.id = props.id;
    this.idPlate = props.idPlate;
    this.type = props.type;
    this.model = props.model;
    this.brand = props.brand;
    this.manufactureYear = props.manufactureYear;
    this.modelYear = props.modelYear;
    this.color = props.color;
    this.ownerId = props.ownerId;
    this.deletedAt = props.deletedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }


  update(partial: Partial<Omit<VehicleProps, 'id' | 'createdAt'>>) {
    if (partial.idPlate !== undefined) this.idPlate = partial.idPlate;
    if (partial.type !== undefined) this.type = partial.type;
    if (partial.model !== undefined) this.model = partial.model;
    if (partial.brand !== undefined) this.brand = partial.brand;
    if (partial.manufactureYear !== undefined) this.manufactureYear = partial.manufactureYear;
    if (partial.modelYear !== undefined) this.modelYear = partial.modelYear;
    if (partial.color !== undefined) this.color = partial.color;
    if (partial.ownerId !== undefined) this.ownerId = partial.ownerId;
    this.updatedAt = new Date();
  }
}