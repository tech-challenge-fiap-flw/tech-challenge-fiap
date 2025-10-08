import { IUserRepository } from '../repositories/IUserRepository';
import NotFoundRequest from '../../../errors/NotFoundRequest';

export class DeleteUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundRequest(`User with id ${id} not found`);
    await this.repo.deactivate(id);
  }
}