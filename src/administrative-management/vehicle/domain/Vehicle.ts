export type VehicleType = 'motorcycle' | 'car' | 'truck';

export interface VehicleProps {
  id: string;
  plate: string;
  type: VehicleType;
  model: string;
  brand: string;
  manufacture_year: number;
  model_year: number;
  color?: string;
  owner?: string; // user id
  created_at?: Date;
  updated_at?: Date;
}

export class Vehicle {
  readonly id: string;
  plate: string;
  type: VehicleType;
  model: string;
  brand: string;
  manufacture_year: number;
  model_year: number;
  color?: string;
  owner?: string;
  created_at: Date;
  updated_at: Date;

  constructor(props: VehicleProps) {
    this.id = props.id;
    this.plate = props.plate;
    this.type = props.type;
    this.model = props.model;
    this.brand = props.brand;
    this.manufacture_year = props.manufacture_year;
    this.model_year = props.model_year;
    this.color = props.color;
    this.owner = props.owner;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? new Date();
  }

  update(data: Partial<Omit<VehicleProps, 'id' | 'created_at'>>) {
    if (data.plate !== undefined) this.plate = data.plate;
    if (data.type !== undefined) this.type = data.type;
    if (data.model !== undefined) this.model = data.model;
    if (data.brand !== undefined) this.brand = data.brand;
    if (data.manufacture_year !== undefined) this.manufacture_year = data.manufacture_year;
    if (data.model_year !== undefined) this.model_year = data.model_year;
    if (data.color !== undefined) this.color = data.color;
    if (data.owner !== undefined) this.owner = data.owner;
    this.updated_at = new Date();
  }
}
