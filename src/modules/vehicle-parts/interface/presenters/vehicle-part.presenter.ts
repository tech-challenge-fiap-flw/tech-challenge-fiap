import { VehiclePart } from '../../domain/entities/vehicle-part';

export type VehiclePartResponseDto = {
  id: number;
  type: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  deletedAt: Date | null;
};

export class VehiclePartPresenter {
  static toResponse(p: VehiclePart): VehiclePartResponseDto {
    return {
      id: p.id,
      type: p.type,
      name: p.name,
      description: p.description,
      quantity: p.quantity,
      price: p.price,
      deletedAt: p.deletedAt
    };
  }
}
