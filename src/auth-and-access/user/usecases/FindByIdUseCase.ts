import { IUserRepository } from '../repositories/IUserRepository';
import NotFoundRequest from '../../../errors/NotFoundRequest';

export class FindByIdUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundRequest(`User with id ${id} not found`);
    return user;
  }
}