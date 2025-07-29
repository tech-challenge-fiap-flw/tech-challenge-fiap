import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VehiclePartItemDto {
  @ApiProperty({ description: 'ID do VehiclePart' })
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty({ description: 'Quantidade do VehiclePart' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
