import { Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../domain/services/auth.service';
import { LocalAuthGuard } from '../../infrastructure/guards/local-auth.guard';
import { AuthRequest } from '../../domain/models/AuthRequest';
import { IsPublic } from '../decorators/is-public.decorator';
import { LoginRequestBody } from '../../domain/models/LoginRequestBody';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Realiza login e retorna um JWT' })
  @ApiBody({ type: LoginRequestBody })
  async login(@Request() request: AuthRequest): Promise<any> {
    return this.authService.retrieveJwt(request.user);
  }
}
