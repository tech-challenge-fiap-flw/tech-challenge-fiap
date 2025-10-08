import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';

export class LogoutUseCase {
  constructor(private authRepo: AuthRepositoryPort) {}
  async execute(refreshToken: string): Promise<void> {
    await this.authRepo.revokeRefreshToken(refreshToken);
  }
}
