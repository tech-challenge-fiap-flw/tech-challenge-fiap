import { PartialType } from '@nestjs/swagger';
import { CreateServiceOrderDto } from './create-service-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateServiceOrderDto extends PartialType(CreateServiceOrderDto) {
  @ApiPropertyOptional({ example: 'Em andamento', description: 'Status atual da OS' })
  @IsOptional()
  @IsString()
  currentStatus?: string;

  @ApiPropertyOptional({ example: true, description: 'Define se a OS está ativa ou não (soft delete)' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: 3, description: 'ID do mecânico que aceitou a OS' })
  @IsOptional()
  @IsInt()
  mechanicId?: number;
}
