import { HttpRequest, HttpResponse } from '../../../../../shared/http/http.types';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.usecase';
import { FindByIdUseCase } from '../../../application/use-cases/find-by-id.usecase';
import { PrismaUserRepository } from '../../../infrastructure/persistence/prisma/user.repository.adapter';
import { UserPresenter } from '../../presenters/user.presenter';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

const repo = new PrismaUserRepository();

export class UserController {
  static async create(req: HttpRequest<CreateUserDto>): Promise<HttpResponse> {
    const uc = new CreateUserUseCase(repo);
    const user = await uc.execute(req.body);
    return { status: 201, body: UserPresenter.toResponse(user) };
  }

  static async update(req: HttpRequest<UpdateUserDto>): Promise<HttpResponse> {
    const userId = req.user?.id;
    const uc = new UpdateUserUseCase(repo);
    const updated = await uc.execute(userId, req.body);
    return { status: 200, body: UserPresenter.toResponse(updated) };
  }

  static async remove(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    const uc = new DeleteUserUseCase(repo);
    await uc.execute(userId);
    return { status: 204 };
  }

  static async me(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    const uc = new FindByIdUseCase(repo);
    const user = await uc.execute(userId);
    return { status: 200, body: UserPresenter.toResponse(user) };
  }
}
