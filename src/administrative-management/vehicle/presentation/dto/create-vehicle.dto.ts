import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty()
  @Matches(/^[A-Z]{3}\d{4}$/, {
    message: 'Placa inválida (ex: ABC1234)',
  })
  id_plate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsNumber()
  manufacture_year: number;

  @ApiProperty()
  @IsNumber()
  model_year: number;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsUUID()
  ownerId: string;
}
