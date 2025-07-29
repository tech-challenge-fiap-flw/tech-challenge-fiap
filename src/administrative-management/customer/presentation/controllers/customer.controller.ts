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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Roles } from '../../../../auth-and-access/auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../../auth-and-access/auth/infrastructure/guards/roles.guard';
import { CustomerResponseDto } from '../dto/customer-response.dto';

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
    type: CustomerResponseDto,
  })
  async create(@Body() data: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customerService.create(data);
    return this.toCustomerResponseDto(customer);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Devolve uma lista de clientes' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: CustomerResponseDto,
    isArray: true,
  })
  async findAll(): Promise<CustomerResponseDto[]> {
    const listCustomer = await this.customerService.findAll();
    return listCustomer.map(this.toCustomerResponseDto)
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Devolve um cliente por ID' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: CustomerResponseDto
  })
  async findOne(@Param('id') id: number): Promise<CustomerResponseDto> {
    const customer = await this.customerService.findById(id);
    return this.toCustomerResponseDto(customer);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza um cliente por ID + Dados parciais' })
  @ApiOkResponse({
    description: 'Estrutura resposta da API',
    type: CustomerResponseDto
  })
  async update(@Param('id') id: number, @Body() data: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customerService.update(id, data);
    return this.toCustomerResponseDto(customer);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta um cliente com base no ID' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.customerService.remove(id);
  }

  private toCustomerResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      cpf: customer.cpf,
      cnpj: customer.cnpj,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      creationDate: customer.creationDate,
      deletedAt: customer.deletedAt,
    };
  }
}