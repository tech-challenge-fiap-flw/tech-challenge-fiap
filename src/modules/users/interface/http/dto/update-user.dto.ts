import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() type?: string;

  @IsOptional() @IsString() @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números' })
  cpf?: string;

  @IsOptional() @IsString() @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 números' })
  cnpj?: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zipCode?: string;
}
