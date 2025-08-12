import { ApiProperty } from '@nestjs/swagger';
import { BudgetVehiclePart } from '../../../../administrative-management/budget-vehicle-part/domain/entities/budget-vehicle-part.entity';
import { VehiclePartItemResponseDto } from './vehicle-part-item.response.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetResponseDto {
  @ApiProperty({ description: 'ID único' })
  id: number;

  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  description: string;

  @ApiProperty({ description: 'Data de remoção' })
  deletedAt: Date | null

  @ApiProperty({ description: 'Data de criação' })
  creationDate: Date | null;

  @ApiProperty({ description: 'Dono' })
  ownerId: number;

  @ApiProperty({ description: 'Total do orçamento' })
  total: number;

  @ApiProperty({ description: 'Id do diagnóstico' })
  diagnosisId: number;

  @ApiProperty({
    type: [VehiclePartItemResponseDto],
    required: false,
    example: [
      { id: 1, quantity: 2 },
      { id: 2, quantity: 1 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePartItemResponseDto)
  vehicleParts?: VehiclePartItemResponseDto[];
}