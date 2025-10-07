import { Injectable } from '@nestjs/common';
import { User } from './auth-and-access/user/domain/entities/user.entity';

@Injectable()
export class AppService {
  getHello(user: User): string {
    return `Authenticated: ${user.name}`;
  }
}
