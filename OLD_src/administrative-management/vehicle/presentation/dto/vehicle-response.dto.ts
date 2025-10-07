import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ description: 'ID único' })
  id: number;

  @ApiProperty({ description: 'Placa' })
  idPlate: string;

  @ApiProperty({ description: 'Tipo' })
  type: string;

  @ApiProperty({ description: 'Modelo' })
  model: string;

  @ApiProperty({ description: 'Marca' })
  brand: string;

  @ApiProperty({ description: 'Ano de fabricação' })
  manufactureYear: number;

  @ApiProperty({ description: 'Ano do modelo' })
  modelYear: number;

  @ApiProperty({ description: 'Cor' })
  color: string;

  @ApiProperty({ description: 'Dono' })
  ownerId: number;

  @ApiProperty({ description: 'Data de remoção' })
  deletedAt: Date | null
}