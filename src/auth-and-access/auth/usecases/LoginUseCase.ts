import { IUserRepository } from '../../user/repositories/IUserRepository';
import { LoginDTO, validateLoginDTO } from '../dtos/LoginDTO';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../services/AuthService';
import UnauthorizedRequest from '../../../errors/UnauthorizedRequest';

export class LoginUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(dto: LoginDTO) {
    validateLoginDTO(dto);

    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.active) throw new UnauthorizedRequest('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedRequest('Invalid credentials');

    // mapeie roles a partir do 'type'
    const roles = user.type === 'admin' ? ['admin'] : ['user'];

    const accessToken = AuthService.signAccessToken({
      sub: String(user.id),
      roles,
      type: user.type,
    });
    const refreshToken = AuthService.signRefreshToken({ sub: String(user.id) });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    };
  }
}
