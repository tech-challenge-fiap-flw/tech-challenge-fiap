import { Controller, Post, Body, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseIntPipe, Put, Get } from '@nestjs/common';
import { BudgetService } from '../../domain/services/budget.service';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { BudgetResponseDto } from '../dto/budget-response.dto';
import { Budget } from '../../domain/entities/budget.entity';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { CurrentUser } from '../../../../auth-and-access/auth/presentation/decorators/current-user.decorator';
import { AcceptBudgetDto } from '../dto/accept-budget.dto';
import { UserFromJwt } from 'src/auth-and-access/auth/domain/models/UserFromJwt';

@ApiTags('Administrativo: Budget')
@UseGuards(RolesGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

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

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Devolve o orçamento por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: BudgetResponseDto
  })
  async findOne(@CurrentUser() user: UserFromJwt, @Param('id') id: number): Promise<BudgetResponseDto> {
    const budget = await this.budgetService.findById(id, ['vehicleParts'], null, user);
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

  @Post(':id/accept')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cliente aceita ou recusa orçamento' })
  @ApiBody({ type: AcceptBudgetDto })
  async decideBudget(
    @Param('id', ParseIntPipe) id: number,
    @Body('accept') accept: boolean,
    @CurrentUser() user: User) {
    return this.budgetService.decideBudget(id, accept, user);
  }

  private toBudgetResponseDto(budget: Budget): BudgetResponseDto {
    return {
      id: budget.id,
      description: budget.description,
      deletedAt: budget.deletedAt,
      creationDate: budget.creationDate,
      ownerId: budget.ownerId,
      diagnosisId: budget.diagnosisId,
      total: budget.total,
      vehicleParts: budget.vehicleParts.map(vehiclePart => ({
        id: vehiclePart.id,
        quantity: vehiclePart.quantity,
      }))
    };
  }
}