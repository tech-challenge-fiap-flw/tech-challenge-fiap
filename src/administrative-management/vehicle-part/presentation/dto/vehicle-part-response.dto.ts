import { ApiProperty } from '@nestjs/swagger';

export class VehiclePartResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'Tipo' })
  type: string;

  @ApiProperty({ description: 'Nome' })
  name: string;

  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  description: string;

  @ApiProperty({ description: 'Quantidade de peças' })
  quantity: number;

  @ApiProperty({ description: 'Data de remoção' })
  deletedAt: Date | null
}