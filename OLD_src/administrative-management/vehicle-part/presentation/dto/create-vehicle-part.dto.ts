import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber
} from 'class-validator';

export class CreateVehiclePartDto {
  @ApiProperty({ description: 'Tipo' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Nome' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Quantidade de peças' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Preço' })
  @IsNumber()
  price: number;
}
