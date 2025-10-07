import { Injectable } from '@nestjs/common';
import { UserPayload } from '../models/UserPayload';
import { UserToken } from '../models/UserToken';
import { UserService } from '../../../user/domain/services/user.service';
import { User } from '../../../user/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  async authenticateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.active) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        }
      }
      throw new Error('Password provided is incorrect.');
    }
    throw new Error(`The e-mail '${email}' is not registered or is inactive.`);
  }

  retrieveJwt(userData: User): UserToken {
    const payload: UserPayload = {
      sub: userData.id,
      email: userData.email,
      name: userData.name,
    }

    const jwt = this.jwtService.sign(payload);
    return { access_token: jwt }
  }
}
