export type VehicleId = number;

export interface VehicleProps {
  id?: VehicleId;
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId: number;
  deletedAt?: Date | null;
}

export class VehicleEntity {
  private props: VehicleProps;
  private constructor(props: VehicleProps) { this.props = props; }
  static create(props: Omit<VehicleProps, 'id' | 'deletedAt'>): VehicleEntity {
    return new VehicleEntity({ ...props, deletedAt: null });
  }
  static restore(props: VehicleProps): VehicleEntity { return new VehicleEntity(props); }
  toJSON(): VehicleProps { return { ...this.props }; }
}
