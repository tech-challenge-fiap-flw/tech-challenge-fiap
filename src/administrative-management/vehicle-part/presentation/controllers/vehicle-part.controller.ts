import { Controller, Post, Body, UseGuards, Delete, HttpCode, HttpStatus, Param, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { VehiclePartService } from '../../domain/services/vehicle-part.service';
import { CreateVehiclePartDto } from '../dto/create-vehicle-part.dto';
import { VehiclePartResponseDto } from '../dto/vehicle-part-response.dto';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { VehiclePart } from '../../domain/entities/vehicle-part.entity';

@ApiTags('Administrativo: Vehicle Part')
@UseGuards(RolesGuard)
@Controller('vehicle-part')
export class VehiclePartController {
  constructor(private readonly vehiclePartService: VehiclePartService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar nova peça para o veiculo' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: VehiclePartResponseDto,
  })
  async create(@Body() createVehiclePartDto: CreateVehiclePartDto): Promise<VehiclePartResponseDto> {
    const vehiclePart = await this.vehiclePartService.create(createVehiclePartDto);
    return this.toVehiclePartResponseDto(vehiclePart);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar peças por nome (LIKE)' })
  @ApiOkResponse({
    description: 'Devolve uma lista com base no parametro',
    type: VehiclePartResponseDto,
    isArray: true
  })
  @ApiQuery({ name: 'name', required: true, description: 'Parte do nome da peça' })
  async findByNameLike(@Query('name') name: string): Promise<VehiclePartResponseDto[]> {
    const listVehiclePart = await this.vehiclePartService.findByNameLike(name);
    return listVehiclePart.map(this.toVehiclePartResponseDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um item com base no ID' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.vehiclePartService.remove(id);
  }

  private toVehiclePartResponseDto(vehiclePart: VehiclePart): VehiclePartResponseDto {
    return {
      id: vehiclePart.id,
      name: vehiclePart.name,
      type: vehiclePart.type,
      description: vehiclePart.description,
      quantity: vehiclePart.quantity,
      deletedAt: vehiclePart.deletedAt,
      price: vehiclePart.price,
    };
  }
}
