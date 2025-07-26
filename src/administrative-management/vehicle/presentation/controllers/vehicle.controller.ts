import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleService } from '../../domain/services/vehicle.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../..//auth-and-access/auth/presentation/decorators/roles.decorator';

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
    type: Vehicle,
  })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve uma lista de veiculos' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Vehicle,
    isArray: true,
  })
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o veiculo por ID' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Vehicle
  })
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza o veiculo por ID + Dados parciais' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Vehicle
  })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
