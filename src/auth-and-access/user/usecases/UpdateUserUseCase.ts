import { IUserRepository } from '../repositories/IUserRepository';
import NotFoundRequest from '../../../errors/NotFoundRequest';
import { UpdateUserDTO } from '../dtos/UpdateUserDTO';

export class UpdateUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(id: number, dto: UpdateUserDTO) {
    const user = await this.repo.findById(id);

    if (!user) throw new NotFoundRequest(`User with id ${id} not found`);

    const updated = await this.repo.update(id, dto);
    return updated;
  }
}