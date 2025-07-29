import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsString, MinLength, ValidateNested } from "class-validator";
import { VehiclePartItemDto } from "./vehicle-part-item.dto";
import { UniqueBy } from "src/shared/presentation/decorators/unique-by.decorator";

export class CreateBudgetDto {
  @ApiProperty({ description: 'Descrição precisa no minimo de 10 caracteres.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Id do Dono' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: 'Id do diagnóstico' })
  @IsNumber()
  diagnosisId: number;

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
}
