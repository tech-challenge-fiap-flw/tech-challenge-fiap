import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CurrentUser } from './auth-and-access/auth/presentation/decorators/current-user.decorator';
import { User } from './auth-and-access/user/domain/entities/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiExcludeEndpoint()
  getHello(@CurrentUser() user: User): string {
    return this.appService.getHello(user);
  }
}
