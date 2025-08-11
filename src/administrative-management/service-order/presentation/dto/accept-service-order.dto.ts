import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptServiceOrderDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  accept: boolean;
}