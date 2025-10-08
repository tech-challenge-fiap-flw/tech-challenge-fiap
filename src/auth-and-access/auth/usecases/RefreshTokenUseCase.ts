import { IUserRepository } from '../../user/repositories/IUserRepository';
import { AuthService } from '../services/AuthService';
import UnauthorizedRequest from '../../../errors/UnauthorizedRequest';
import BadRequest from '../../../errors/BadRequest';

export class RefreshTokenUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) throw new BadRequest('refreshToken é obrigatório');

    let payload: { sub: string };

    try {
      payload = AuthService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedRequest('refreshToken inválido');
    }

    const userId = Number(payload.sub);
    const user = await this.userRepo.findById(userId);

    if (!user || !user.active) throw new UnauthorizedRequest('User not found or inactive');

    const roles = user.type === 'admin' ? ['admin'] : ['user'];
    const newAccess = AuthService.signAccessToken({
      sub: String(user.id),
      roles,
      type: user.type,
    });

    const newRefresh = AuthService.signRefreshToken({ sub: String(user.id) });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
    };
  }
}
