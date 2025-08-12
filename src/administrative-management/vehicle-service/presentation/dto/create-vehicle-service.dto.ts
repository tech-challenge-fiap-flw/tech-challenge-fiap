import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateVehicleServiceDto {
  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Serviço completo de troca de óleo' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Preço' })
  @IsNumber()
  price: number;
}
