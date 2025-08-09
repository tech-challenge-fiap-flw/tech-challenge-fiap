import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Matches
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Placa' })
  @Matches(/^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/, {
    message: 'Placa inválida (ex: ABC1234)',
  })
  idPlate: string;

  @ApiProperty({ description: 'Tipo' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Modelo' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Marca' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ description: 'Ano de fabricação' })
  @IsNumber()
  manufactureYear: number;

  @ApiProperty({ description: 'Ano do modelo' })
  @IsNumber()
  modelYear: number;

  @ApiProperty({ description: 'Cor' })
  @IsString()
  color: string;

  @ApiProperty()
  @IsNumber()
  ownerId: number;
}
