import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleServiceDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumber()
  price?: number;
}
