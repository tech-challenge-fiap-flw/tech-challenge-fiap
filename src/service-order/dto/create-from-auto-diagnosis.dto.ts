import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsArray, ValidateNested, ArrayUnique, IsNumber } from 'class-validator';
import { VehiclePartItemDto } from '../../administrative-management/budget/presentation/dto/vehicle-part-item.dto';
import { Type } from 'class-transformer';
import { UniqueBy } from '../../shared/presentation/decorators/unique-by.decorator';

export class CreateFromAutoDiagnosisDto {
  @ApiProperty({ example: 'Troca de óleo e filtro', description: 'Descrição da ordem de serviço' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 5, description: 'ID do veículo vinculado' })
  @IsNotEmpty()
  @IsInt()
  vehicleId: number;

  @ApiProperty({
    type: [VehiclePartItemDto],
    description: 'Lista de peças com id e quantidade',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiclePartItemDto)
  @UniqueBy('id', {
    message: 'A lista de peças não pode conter itens com o mesmo id.',
  })
  vehicleParts: VehiclePartItemDto[];

  @ApiProperty({
    description: 'Lista de IDs dos serviços',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayUnique({ message: 'A lista de serviços não pode conter IDs duplicados.' })
  @IsNumber({}, { each: true })
  vehicleServicesIds: number[];
}
