import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ example: 'Troca de óleo e filtro', description: 'Descrição da ordem de serviço' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1, description: 'ID do orçamento associado (opcional)' })
  @IsOptional()
  @IsInt()
  budgetId?: number;

  @ApiProperty({ example: 5, description: 'ID do veículo vinculado' })
  @IsNotEmpty()
  @IsInt()
  vehicleId: number;
}
