import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VehiclePartItemDto } from './create-budget.dto';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePartItemDto)
  vehicleParts!: VehiclePartItemDto[];

  @IsOptional()
  @IsArray()
  vehicleServicesIds?: number[];
}
