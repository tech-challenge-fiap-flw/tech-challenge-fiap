import { Vehicle } from '../../domain/entities/vehicle';

export type VehicleResponseDto = {
  id: number;
  idPlate: string;
  type: string;
  model: string;
  brand: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  ownerId: number;
  deletedAt: Date | null;
};

export class VehiclePresenter {
  static toResponse(v: Vehicle): VehicleResponseDto {
    return {
      id: v.id,
      idPlate: v.idPlate,
      type: v.type,
      model: v.model,
      brand: v.brand,
      manufactureYear: v.manufactureYear,
      modelYear: v.modelYear,
      color: v.color,
      ownerId: v.ownerId,
      deletedAt: v.deletedAt
    };
  }
}
