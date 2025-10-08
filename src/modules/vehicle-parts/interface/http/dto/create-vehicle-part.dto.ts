import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';

export class CreateVehiclePartDto {
  @IsString() @IsNotEmpty()
  type!: string;

  @IsString() @IsNotEmpty()
  name!: string;

  @IsString() @MinLength(10)
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  price!: number;
}
