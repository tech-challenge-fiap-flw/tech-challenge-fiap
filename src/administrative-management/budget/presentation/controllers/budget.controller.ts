import { Controller, Post, Body, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseIntPipe, Put } from '@nestjs/common';
import { BudgetService } from '../../domain/services/budget.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { BudgetResponseDto } from '../dto/budget-response.dto';
import { Budget } from '../../domain/entities/budget.entity';

@ApiTags('Administrativo: Budget')
@UseGuards(RolesGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo Orçamento' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: BudgetResponseDto,
  })
  async create(@Body() createBudgetDto: CreateBudgetDto): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.create(createBudgetDto);
    return this.toBudgetResponseDto(budget);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar orçamento por ID' })
  @ApiOkResponse({
    description: 'Orçamento atualizado com sucesso',
    type: BudgetResponseDto
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBudgetDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.update(id, updateDto);
    return this.toBudgetResponseDto(budget);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um orçamento com base no ID' })
  remove(@Param('id') id: number): Promise<void> {
    return this.budgetService.remove(id);
  }

  private toBudgetResponseDto(budget: Budget): BudgetResponseDto {
    return {
      id: budget.id,
      description: budget.description,
      deletedAt: budget.deletedAt,
      creationDate: budget.creationDate,
      ownerId: budget.ownerId,
      diagnosisId: budget.diagnosisId,
      vehicleParts: budget.vehicleParts.map(vehiclePart => ({
        id: vehiclePart.id,
        quantity: vehiclePart.quantity,
      }))
    };
  }
}