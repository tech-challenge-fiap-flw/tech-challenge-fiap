import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleService } from '../../domain/services/vehicle.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../..//auth-and-access/auth/presentation/decorators/roles.decorator';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@ApiTags('Administrativo: Veiculos')
@UseGuards(RolesGuard)
@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo veiculo' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto,
  })
  async create(@Body() createVehicleDto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.create(createVehicleDto);
    return this.toVehicleResponseDto(vehicle);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve uma lista de veiculos' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto,
    isArray: true,
  })
  async findAll(): Promise<VehicleResponseDto[]> {
    const listVehicle = await this.vehicleService.findAll();
    return listVehicle.map(this.toVehicleResponseDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o veiculo por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto
  })
  async findOne(@Param('id') id: number): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.findById(id);
    return this.toVehicleResponseDto(vehicle);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza o veiculo por ID + Dados parciais' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto
  })
  async update(@Param('id') id: number, @Body() updateVehicleDto: UpdateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleService.update(id, updateVehicleDto);
    return this.toVehicleResponseDto(vehicle);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.vehicleService.remove(id);
  }

  private toVehicleResponseDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      idPlate: vehicle.idPlate,
      type: vehicle.type,
      model: vehicle.model,
      brand: vehicle.brand,
      manufactureYear: vehicle.manufactureYear,
      modelYear: vehicle.modelYear,
      color: vehicle.color,
      ownerId: vehicle.ownerId,
      deletedAt: vehicle.deletedAt,
    };
  }
}