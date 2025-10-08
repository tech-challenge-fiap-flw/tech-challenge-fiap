import { IsString, IsOptional, IsNumber, Matches } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional() @Matches(/^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/, { message: 'Placa inválida (ex: ABC1234)' })
  idPlate?: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsString()
  brand?: string;

  @IsOptional() @IsNumber()
  manufactureYear?: number;

  @IsOptional() @IsNumber()
  modelYear?: number;

  @IsOptional() @IsString()
  color?: string;
}
