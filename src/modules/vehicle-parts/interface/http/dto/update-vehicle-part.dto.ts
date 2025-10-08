import { IsString, IsOptional, MinLength, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateVehiclePartDto {
  @IsOptional() @IsString() @IsNotEmpty()
  type?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsString() @MinLength(10)
  description?: string;

  @IsOptional() @IsNumber()
  quantity?: number;

  @IsOptional() @IsNumber()
  price?: number;
}
