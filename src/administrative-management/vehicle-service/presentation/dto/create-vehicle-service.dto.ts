import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVehicleServicePartDto } from './create-vehicle-service-part.dto';

export class CreateVehicleServiceDto {
  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Serviço completo de troca de óleo' })
  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleServicePartDto)
  @ApiProperty({ type: [CreateVehicleServicePartDto] })
  parts: CreateVehicleServicePartDto[];
}
