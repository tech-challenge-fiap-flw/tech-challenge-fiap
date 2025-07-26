import { ApiProperty } from '@nestjs/swagger';

export class DiagnosisResponseDto {
  @ApiProperty({ description: 'Código' })
  id: number;

  @ApiProperty({ description: 'Descrição' })
  description: string;

  @ApiProperty({ description: 'ID do veiculo' })
  vehicleId: number;

  @ApiProperty({ description: 'Mecânico responsável' })
  responsibleMechanicId: number;

  @ApiProperty({ description: 'Data de criação' })
  creationDate: Date;

  @ApiProperty({ description: 'Data de remoção' })
  deletedAt: Date | null
}