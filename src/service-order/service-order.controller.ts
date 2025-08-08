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
} from '@nestjs/swagger';
import { ServiceOrderService } from './service-order.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { CurrentUser } from 'src/auth-and-access/auth/presentation/decorators/current-user.decorator';
import { Roles } from 'src/auth-and-access/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from 'src/auth-and-access/auth/infrastructure/guards/roles.guard';
import { User } from 'src/auth-and-access/user/domain/entities/user.entity';

@ApiTags('Ordem de Serviço')
@UseGuards(RolesGuard)
@Controller('service-order')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova OS' })
  @ApiCreatedResponse({ description: 'OS criada com sucesso' })
  async create(@CurrentUser() user: User, @Body() dto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(user, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('mechanic', 'cliente')
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
  @Roles('mechanic')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete da OS' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.remove(id);
  }

  @Post(':id/accept')
  @ApiBearerAuth()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Aceitar ou recusar OS' })
  @ApiOkResponse({ description: 'Decisão registrada com sucesso' })
  async decideOrder(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number,@Body() body: { accept: boolean },
  ) {
    return this.serviceOrderService.acceptOrder(user, id, body.accept);
  }

  @Post(':id/budget/:budgetId')
  @ApiBearerAuth()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Atribuir orçamento à OS' })
  @ApiOkResponse({ description: 'Orçamento atribuído com sucesso' })
  async assignBudget(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Param('budgetId', ParseIntPipe) budgetId: number) {
    return this.serviceOrderService.assignBudget(user, id, budgetId);
  }

  @Post(':id/start')
  @ApiBearerAuth()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Iniciar reparo da OS' })
  @ApiOkResponse({ description: 'OS em execução' })
  async startRepair( @CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.startRepair(user, id);
  }
  
  @Post(':id/finish')
  @ApiBearerAuth()
  @Roles('mechanic')
  @ApiOperation({ summary: 'Finalizar reparo da OS' })
  @ApiOkResponse({ description: 'OS finalizada' })
  async finishRepair(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.finishRepair(user, id);
  }
  
  @Post(':id/delivered')
  @ApiBearerAuth()
  @Roles('cliente')
  @ApiOperation({ summary: 'Cliente confirma entrega do veículo' })
  @ApiOkResponse({ description: 'Veículo entregue' })
  async delivered(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.serviceOrderService.delivered(user, id);
  }
}
