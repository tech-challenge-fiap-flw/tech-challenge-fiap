import { IsNumber, IsString } from 'class-validator';

export class CreateVehicleServiceDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  price!: number;
}
