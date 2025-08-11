import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Matches
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Placa', example: 'ABC1234' })
  @Matches(/^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/, {
    message: 'Placa inválida (ex: ABC1234)',
  })
  idPlate: string;

  @ApiProperty({ description: 'Tipo', example: 'Sedan' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Modelo', example: 'Civic' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Marca', example: 'Honda' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ description: 'Ano de fabricação', example: 2020 })
  @IsNumber()
  manufactureYear: number;

  @ApiProperty({ description: 'Ano do modelo', example: 2020 })
  @IsNumber()
  modelYear: number;

  @ApiProperty({ description: 'Cor', example: 'Preto' })
  @IsString()
  color: string;

  @ApiProperty()
  @IsNumber()
  ownerId: number;
}
