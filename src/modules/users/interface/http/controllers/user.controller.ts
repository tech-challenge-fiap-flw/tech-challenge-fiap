import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.usecase';
import { FindByIdUseCase } from '../../../application/use-cases/find-by-id.usecase';
import { PrismaUserRepository } from '../../../infrastructure/persistence/prisma/user.repository.adapter';
import { UserPresenter } from '../../presenters/user.presenter';

const repo = new PrismaUserRepository();

export class UserController {
  static async create(req: Request, res: Response) {
    const uc = new CreateUserUseCase(repo);
    const user = await uc.execute(req.body);
    return res.status(201).json(UserPresenter.toResponse(user));
  }

  static async update(req: Request, res: Response) {
    const userId = Number((req as any).userId);
    const uc = new UpdateUserUseCase(repo);
    const updated = await uc.execute(userId, req.body);
    return res.json(UserPresenter.toResponse(updated));
  }

  static async remove(req: Request, res: Response) {
    const userId = Number((req as any).userId);
    const uc = new DeleteUserUseCase(repo);
    await uc.execute(userId);
    return res.status(204).send();
  }

  static async me(req: Request, res: Response) {
    const userId = Number((req as any).userId);
    const uc = new FindByIdUseCase(repo);
    const user = await uc.execute(userId);
    return res.json(UserPresenter.toResponse(user));
  }
}
