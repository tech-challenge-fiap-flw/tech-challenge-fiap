export interface VehicleResponseDTO {
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
}