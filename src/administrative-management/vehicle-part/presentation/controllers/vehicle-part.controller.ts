import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth-and-access/auth/infrastructure/guards/roles.guard';
import { VehiclePartService } from '../../domain/services/vehicle-part.service';
import { CreateVehiclePartDto } from '../dto/create-vehicle-part.dto';
import { VehiclePartResponseDto } from '../dto/vehicle-part-response.dto';

@ApiTags('Administrativo: Vehicle Part')
@UseGuards(RolesGuard)
@Controller('vehicle-part')
export class VehiclePartController {
  constructor(private readonly vehiclePartService: VehiclePartService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova peça para o veiculo' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: VehiclePartResponseDto,
  })
  create(@Body() createVehiclePartDto: CreateVehiclePartDto) {
    return this.vehiclePartService.create(createVehiclePartDto);
  }
}
