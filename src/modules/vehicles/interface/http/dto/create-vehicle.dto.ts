import { IsString, IsNotEmpty, IsNumber, Matches, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @Matches(/^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/, { message: 'Placa inválida (ex: ABC1234)' })
  idPlate!: string;

  @IsString() @IsNotEmpty()
  type!: string;

  @IsString() @IsNotEmpty()
  model!: string;

  @IsString() @IsNotEmpty()
  brand!: string;

  @IsNumber()
  manufactureYear!: number;

  @IsNumber()
  modelYear!: number;

  @IsString()
  color!: string;

  @IsOptional() @IsNumber()
  ownerId?: number;
}
