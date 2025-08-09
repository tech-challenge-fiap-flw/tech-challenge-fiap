import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptBudgetDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  accept: boolean;
}