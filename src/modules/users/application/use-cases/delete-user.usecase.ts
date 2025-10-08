import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';

export class DeleteUserUseCase {
  constructor(private repo: UserRepositoryPort) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);

    if (!existing) {
      const err: any = new Error(`User with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    await this.repo.softDelete(id);
  }
}
