import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus, HttpCode, Put } from '@nestjs/common';
import { DiagnosisService } from '../../domain/services/diagnosis.service';
import { CreateDiagnosisDto } from '../dto/create-diagnosis.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { DiagnosisResponseDto } from '../dto/diagnosis-response.dto';
import { UpdateDiagnosisDto } from '../dto/update-diagnosis.dto';
import { Diagnosis } from '../../domain/entities/diagnosis.entity';

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
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.diagnosisService.create(createDiagnosisDto);
    return this.toVehicleResponseDto(diagnosis);
  }

  @Get('/vehicle/:vehicleId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve uma lista de diagnóstico pelo id do veiculo' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto,
    isArray: true,
  })
  async findAllByVehicleId(@Param('vehicleId') vehicleId: number): Promise<DiagnosisResponseDto[]> {
    const listVehicle = await this.diagnosisService.findAllByVehicleId(vehicleId);
    return listVehicle.map(this.toVehicleResponseDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um diagnóstico com base no ID' })
  remove(@Param('id') id: number): Promise<void> {
    return this.diagnosisService.remove(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o diagnóstico por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto
  })
  async findOne(@Param('id') id: number): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.diagnosisService.findById(id);
    return this.toVehicleResponseDto(diagnosis);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza o diagnóstico por ID + Dados parciais' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: DiagnosisResponseDto
  })
  async update(@Param('id') id: number, @Body() updateDiagnosisDto: UpdateDiagnosisDto): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.diagnosisService.update(id, updateDiagnosisDto);
    return this.toVehicleResponseDto(diagnosis);
  }

  private toVehicleResponseDto(diagnosis: Diagnosis): DiagnosisResponseDto {
    return {
      id: diagnosis.id,
      description: diagnosis.description,
      vehicleId: diagnosis.vehicleId,
      responsibleMechanicId: diagnosis.responsibleMechanicId,
      creationDate: diagnosis.creationDate,
      deletedAt: diagnosis.deletedAt,
    };
  }
}
