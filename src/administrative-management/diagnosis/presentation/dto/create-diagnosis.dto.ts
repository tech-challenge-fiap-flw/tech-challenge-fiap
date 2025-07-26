import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, MinLength } from 'class-validator';

export class CreateDiagnosisDto {
  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'ID do veículo' })
  @IsNumber()
  vehicleId: number;

  @ApiProperty({ description: 'ID do mecânico responsável' })
  @IsNumber()
  responsibleMechanicId: number;
}
