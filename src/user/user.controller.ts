import { Controller, Post, Put, Delete, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.toUserResponseDto(user);
  }

  @Put()
  async updateUser(@CurrentUser() userData: User, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(userData.id, updateUserDto);
    return this.toUserResponseDto(user);
  }

  @Delete()
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
    };
  }
}
