import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, MinLength, IsNumber, ArrayUnique } from 'class-validator';
import { VehiclePartItemDto } from '../../../budget/presentation/dto/vehicle-part-item.dto';
import { Type } from 'class-transformer';
import { UniqueBy } from '../../../../shared/presentation/decorators/unique-by.decorator';

export class AssignBudgetDto {
  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  @IsString()
  @MinLength(10)
  description: string;

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
