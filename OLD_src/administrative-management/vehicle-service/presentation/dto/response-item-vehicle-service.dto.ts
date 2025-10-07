import { ApiProperty } from '@nestjs/swagger';

export class ResponseItemVehicleServiceDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Troca de óleo' })
  name: string;

  @ApiProperty({ example: 'Serviço para troca de óleo do motor' })
  description?: string;

  @ApiProperty({ description: 'Preço' })
  price: number;
}