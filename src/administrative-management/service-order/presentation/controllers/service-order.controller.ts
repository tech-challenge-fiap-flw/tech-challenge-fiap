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
import { UserFromJwt } from 'src/auth-and-access/auth/domain/models/UserFromJwt';

@ApiTags('Ordem de Serviço')
@UseGuards(RolesGuard)
@Controller('service-order')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Buscar OS por ID' })
  async findOne(@CurrentUser() user: UserFromJwt, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.findOne(id, null, user);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar todas as OS' })
  async findAll(@CurrentUser() user: UserFromJwt) {
    return this.serviceOrderService.findAll(user);
  }

  @Get('customer/:email')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Buscar OS por e-mail do cliente' })
  async findByCustomerEmail(@Param('email') email: string) {
    return this.serviceOrderService.findByCustomerEmail(email);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete da OS' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.remove(id);
  }

  @Post(':id/accept')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Aceitar ou recusar OS' })
  @ApiOkResponse({ description: 'Decisão registrada com sucesso' })
  @ApiBody({ type: AcceptServiceOrderDto })
  async decideOrder(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number,@Body() body: { accept: boolean },
  ) {
    return this.serviceOrderService.acceptOrder(user, id, body.accept);
  }

  @Post(':id/budget')
  @ApiBearerAuth()
  @Roles('admin')
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
  @Roles('admin')
  @ApiOperation({ summary: 'Finalizar reparo da OS' })
  @ApiOkResponse({ description: 'OS finalizada' })
  async finishRepair(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.finishRepair(user, id);
  }
  
  @Post(':id/delivered')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cliente confirma entrega do veículo' })
  @ApiOkResponse({ description: 'Veículo entregue' })
  async delivered(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.delivered(user, id);
  }

  @Get(':id/execution-time')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Obter tempo de execução da OS pelo ID' })
  async getExecutionTime(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.getExecutionTimeById(id);
  }

  @Get('execution-time/average')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Obter tempo médio de execução de todas as OS' })
  async getAverageExecutionTime() {
    return this.serviceOrderService.getAverageExecutionTime();
  }
}
