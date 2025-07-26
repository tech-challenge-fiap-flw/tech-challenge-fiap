import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsBoolean, Matches, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Nome completo do cliente' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'CPF com 11 números' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números' })
  cpf: string;

  @ApiPropertyOptional({ description: 'CNPJ com 14 números' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 números' })
  cnpj?: string;

  @ApiProperty({ description: 'Telefone de contato' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Email do cliente' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Endereço' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Indica se o cliente está ativo', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
