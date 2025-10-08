import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { User } from '../../domain/entities/user';

type Input = Partial<Pick<User, 'name' | 'type' | 'cpf' | 'cnpj' | 'phone' | 'address' | 'city' | 'state' | 'zipCode'>>;

export class UpdateUserUseCase {
  constructor(private repo: UserRepositoryPort) {}

  async execute(id: number, data: Input): Promise<User> {
    const existing = await this.repo.findById(id);

    if (!existing) {
      const err: any = new Error(`User with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    return this.repo.update(id, data);
  }
}
