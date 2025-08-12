import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { VehicleServiceService } from '../../domain/services/vehicle-service.service';
import { CreateVehicleServiceDto } from '../dto/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../dto/update-vehicle-service.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { ResponseItemVehicleServiceDto } from '../dto/response-item-vehicle-service.dto';
import { VehicleService } from '../../domain/entities/vehicle-service.entity';

@ApiTags('Administrativo: Vehicle Services')
@UseGuards(RolesGuard)
@Controller('vehicle-services')
export class VehicleServiceController {
  constructor(private readonly serviceService: VehicleServiceService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo Serviço de Veículo' })
  @ApiBody({ type: CreateVehicleServiceDto })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: ResponseItemVehicleServiceDto,
  })
  async create(@Body() dto: CreateVehicleServiceDto) {
    const createdService = await this.serviceService.create(dto);
    return this.toVehicleServiceResponseDto(createdService);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos os Serviços de Veículo' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: ResponseItemVehicleServiceDto,
    isArray: true,
  })
  async findAll() {
    const services = await this.serviceService.findAll();
    return services.map(service => this.toVehicleServiceResponseDto(service));
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Buscar Serviço de Veículo por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: ResponseItemVehicleServiceDto,
  })
  async findOne(@Param('id') id: number) {
    const service = await this.serviceService.findOne(id);
    return this.toVehicleServiceResponseDto(service);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar Serviço de Veículo por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: ResponseItemVehicleServiceDto,
  })
  async update(@Param('id') id: number, @Body() dto: UpdateVehicleServiceDto) {
    const updatedService = await this.serviceService.update(id, dto);
    return this.toVehicleServiceResponseDto(updatedService);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Remover Serviço de Veículo por ID' })
  async remove(@Param('id') id: number) {
    await this.serviceService.remove(id);
  }

  private toVehicleServiceResponseDto(service: VehicleService): ResponseItemVehicleServiceDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
    };
  }
}
