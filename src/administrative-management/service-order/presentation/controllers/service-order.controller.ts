import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ServiceOrderService } from '../../domain/services/service-order.service';
import { CurrentUser } from '../../../../auth-and-access/auth/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { AcceptServiceOrderDto } from '../dto/accept-service-order.dto';
import { CreateServiceOrderDto } from '../dto/create-service-order.dto';
import { AssignBudgetDto } from '../dto/assign-budget.dto';
import { ServiceOrder } from '../../domain/entities/service-order.entity';

@ApiTags('Ordem de Serviço')
@UseGuards(RolesGuard)
@Controller('service-order')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('mechanic', 'cliente', 'admin')
  @ApiOperation({ summary: 'Criar nova OS' })
  @ApiCreatedResponse({
    description: 'OS criada com sucesso',
    type: ServiceOrder,
  })
  async create(@CurrentUser() user: User, @Body() dto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(user, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('mechanic', 'cliente', 'admin')
  @ApiOperation({ summary: 'Buscar OS por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.findOne(id);
  }

  @Get('customer/:email')
  @ApiBearerAuth()
  @Roles('mechanic', 'cliente')
  @ApiOperation({ summary: 'Buscar OS por e-mail do cliente' })
  async findByCustomerEmail(@Param('email') email: string) {
    return this.serviceOrderService.findByCustomerEmail(email);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete da OS' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.remove(id);
  }

  @Post(':id/accept')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Aceitar ou recusar OS' })
  @ApiOkResponse({ description: 'Decisão registrada com sucesso' })
  @ApiBody({ type: AcceptServiceOrderDto })
  async decideOrder(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number,@Body() body: { accept: boolean },
  ) {
    return this.serviceOrderService.acceptOrder(user, id, body.accept);
  }

  @Post(':id/budget')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Criar e atribuir orçamento à OS' })
  @ApiOkResponse({ description: 'Orçamento criado e atribuído com sucesso' })
  async assignBudget(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() assignBudgetDto: AssignBudgetDto,
  ) {
    return this.serviceOrderService.assignBudget(user, id, assignBudgetDto);
  }

  @Post(':id/start')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Iniciar reparo da OS' })
  @ApiOkResponse({ description: 'OS em execução' })
  async startRepair( @CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.startRepair(user, id);
  }
  
  @Post(':id/finish')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Finalizar reparo da OS' })
  @ApiOkResponse({ description: 'OS finalizada' })
  async finishRepair(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.finishRepair(user, id);
  }
  
  @Post(':id/delivered')
  @ApiBearerAuth()
  @Roles('cliente', 'admin')
  @ApiOperation({ summary: 'Cliente confirma entrega do veículo' })
  @ApiOkResponse({ description: 'Veículo entregue' })
  async delivered(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.delivered(user, id);
  }

  @Get(':id/execution-time')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Obter tempo de execução da OS pelo ID' })
  async getExecutionTime(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.getExecutionTimeById(id);
  }

  @Get('execution-time/average')
  @ApiBearerAuth()
  @Roles('mechanic', 'admin')
  @ApiOperation({ summary: 'Obter tempo médio de execução de todas as OS' })
  async getAverageExecutionTime() {
    return this.serviceOrderService.getAverageExecutionTime();
  }
}
