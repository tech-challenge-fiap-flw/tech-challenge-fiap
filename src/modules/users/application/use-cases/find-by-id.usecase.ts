import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { User } from '../../domain/entities/user';

export class FindByIdUseCase {
  constructor(private repo: UserRepositoryPort) {}

  async execute(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      const err: any = new Error(`User with id ${id} not found`);
      err.status = 404;
      throw err;
    }
    return user;
  }
}
