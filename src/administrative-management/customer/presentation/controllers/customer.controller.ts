import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { CustomerService } from '../../domain/services/customer.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';

@ApiTags('Administrativo: Clientes')
@UseGuards(RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Customer,
  })
  async create(@Body() data: CreateCustomerDto): Promise<Customer> {
    return this.customerService.create(data);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Devolve uma lista de clientes' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Customer,
    isArray: true,
  })
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Devolve um cliente por ID' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Customer
  })
  async findOne(@Param('id') id: number): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza um cliente por ID + Dados parciais' })
  @ApiCreatedResponse({
    description: 'Estrutura resposta da API',
    type: Customer
  })
  async update(@Param('id') id: number, @Body() data: UpdateCustomerDto): Promise<Customer> {
    return this.customerService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um cliente com base no ID' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.customerService.remove(id);
  }
}