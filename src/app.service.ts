import { Injectable } from '@nestjs/common';
import { User } from './user/entities/user.entity';

@Injectable()
export class AppService {
  getHello(user: User): string {
    return `Authenticated: ${user.name}`;
  }
}
