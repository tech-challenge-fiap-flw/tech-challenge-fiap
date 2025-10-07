export interface CreateVehicleDTO {
  plate: string;
  type: 'motorcycle' | 'car' | 'truck';
  model: string;
  brand: string;
  manufacture_year: number;
  model_year: number;
  color?: string;
  owner?: string;
}
