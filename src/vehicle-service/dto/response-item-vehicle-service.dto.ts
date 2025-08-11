import { ApiProperty } from '@nestjs/swagger';

export class VehiclePartDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 100 })
  quantity: number;

  @ApiProperty({ example: 1 })
  partId: number;

  @ApiProperty({ example: 'Filtro de óleo' })
  partName: string;
}

export class ResponseItemVehicleServiceDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Troca de óleo' })
  name: string;

  @ApiProperty({ example: 'Serviço para troca de óleo do motor' })
  description?: string;

  @ApiProperty({ type: [VehiclePartDto] })
  parts: VehiclePartDto[];
}