import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleService } from '../../domain/services/vehicle.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../..//auth-and-access/auth/presentation/decorators/roles.decorator';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

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
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve uma lista de veiculos' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto,
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
    type: VehicleResponseDto
  })
  findOne(@Param('id') id: number) {
    return this.vehicleService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza o veiculo por ID + Dados parciais' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: VehicleResponseDto
  })
  update(@Param('id') id: number, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.vehicleService.remove(id);
  }
}
