import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'CpfOrCnpj', async: false })
class CpfOrCnpjConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.cpf || obj.cnpj);
  }

  defaultMessage() {
    return 'CPF ou CNPJ deve ser informado (pelo menos um)';
  }
}

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'admin', description: 'Tipo de usuário (ex: admin, cliente, etc.)' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: '12345678910', description: 'CPF com 11 números' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números' })
  cpf: string;

  @ApiPropertyOptional({ example: 'Remover se não for utilizar', description: 'CNPJ com 14 números' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 números' })
  cnpj?: string;

  @ApiProperty({ example: '11940419049', description: 'Telefone de contato' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'Rua Prof Norberto Denzin 88', description: 'Endereço' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'São Bernardo do Campo', description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP', description: 'Estado' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '09726-305', description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

Validate(CpfOrCnpjConstraint)(CreateUserDto.prototype, undefined);