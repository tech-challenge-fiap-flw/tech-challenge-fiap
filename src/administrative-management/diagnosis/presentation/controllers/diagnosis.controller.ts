import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus, HttpCode, Put } from '@nestjs/common';
import { DiagnosisService } from '../../domain/services/diagnosis.service';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { DiagnosisResponseDto } from '../dto/diagnosis-response.dto';
import { UpdateDiagnosisDto } from '../dto/update-diagnosis.dto';

@ApiTags('Administrativo: Diagnóstico')
@UseGuards(RolesGuard)
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo diagnóstico' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto,
  })
  create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosisService.create(createDiagnosisDto);
  }

  @Get('/vehicle/:vehicleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve uma lista de diagnóstico pelo id do veiculo' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto,
    isArray: true,
  })
  findAllByVehicleId(@Param('vehicleId') vehicleId: number) {
    return this.diagnosisService.findAllByVehicleId(vehicleId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um diagnóstico com base no ID' })
  remove(@Param('id') id: number) {
    return this.diagnosisService.remove(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o diagnóstico por ID' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto
  })
  findOne(@Param('id') id: number) {
    return this.diagnosisService.findById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza o diagnóstico por ID + Dados parciais' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto
  })
  update(@Param('id') id: number, @Body() updateDiagnosisDto: UpdateDiagnosisDto) {
    return this.diagnosisService.update(id, updateDiagnosisDto);
  }
}
