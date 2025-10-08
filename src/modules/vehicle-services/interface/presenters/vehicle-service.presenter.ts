import { VehicleServiceEntity } from '../../domain/entities/vehicle-service';

export type ResponseItemVehicleServiceDto = {
  id: number;
  name: string;
  description: string | null;
  price: number;
};

export class VehicleServicePresenter {
  static toResponse(s: VehicleServiceEntity): ResponseItemVehicleServiceDto {
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price
    };
  }
}
