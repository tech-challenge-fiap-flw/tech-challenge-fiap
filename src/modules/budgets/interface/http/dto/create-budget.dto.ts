import { IsArray, IsNumber, IsString, MinLength, ArrayUnique, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VehiclePartItemDto {
  @IsNumber() id!: number;
  @IsNumber() quantity!: number;
}

export class CreateBudgetDto {
  @IsString()
  @MinLength(10)
  description!: string;

  @IsNumber()
  ownerId!: number;

  @IsNumber()
  diagnosisId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePartItemDto)
  vehicleParts!: VehiclePartItemDto[];

  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  vehicleServicesIds!: number[];
}
