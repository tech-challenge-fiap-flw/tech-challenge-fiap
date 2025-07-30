import { Controller, Post, Put, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../domain/services/user.service';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { IsPublic } from 'src/auth-and-access/auth/presentation/decorators/is-public.decorator';
import { CurrentUser } from 'src/auth-and-access/auth/presentation/decorators/current-user.decorator';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.toUserResponseDto(user);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuário logado' })
  async updateUser(@CurrentUser() userData: User, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(userData.id, updateUserDto);
    return this.toUserResponseDto(user);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar usuário logado' })
  async deleteUser(@CurrentUser() userData: User): Promise<void> {
    await this.userService.deleteUser(userData.id);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      active: user.active,
      creationDate: user.creationDate,
      cpf: user.cpf,
      cnpj: user.cnpj,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
    };
  }
}