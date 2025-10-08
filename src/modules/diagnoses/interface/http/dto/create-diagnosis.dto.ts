import { IsString, IsNumber, MinLength, IsOptional } from 'class-validator';

export class CreateDiagnosisDto {
  @IsString() @MinLength(10)
  description!: string;

  @IsNumber()
  vehicleId!: number;

  @IsOptional() @IsNumber()
  responsibleMechanicId?: number;
}
