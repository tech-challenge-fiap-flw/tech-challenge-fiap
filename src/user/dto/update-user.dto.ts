import { IsEmail, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João da Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://meusite.com/foto.jpg' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Tipo de usuário (ex: admin, cliente)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'novaSenha123', minLength: 6 })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
