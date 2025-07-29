import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class VehiclePartItemResponseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
