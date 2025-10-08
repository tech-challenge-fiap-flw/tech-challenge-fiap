import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() @IsString() name!: string;
  @IsNotEmpty() @IsEmail()  email!: string;
  @IsNotEmpty() @MinLength(6) password!: string;

  @IsNotEmpty() @IsString() type!: string;

  @IsOptional() @IsString() @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 números' })
  cpf?: string;

  @IsOptional() @IsString() @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 números' })
  cnpj?: string;

  @IsNotEmpty() @IsString() phone!: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() zipCode?: string;
}
