import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { User } from '../../domain/entities/user';

export class FindByEmailUseCase {
  constructor(private repo: UserRepositoryPort) {}
  async execute(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }
}
