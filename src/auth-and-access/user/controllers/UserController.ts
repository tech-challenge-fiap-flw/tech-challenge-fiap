import { Request, Response } from 'express';
import { CreateUserUseCase } from '../usecases/CreateUserUseCase';
import { UpdateUserUseCase } from '../usecases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../usecases/DeleteUserUseCase';
import { FindByIdUseCase } from '../usecases/FindByIdUseCase';
import { User } from '../domain/User';
import { UserResponseDTO } from '../dtos/UserResponseDTO';

export class UserController {
  constructor(
    private createUC: CreateUserUseCase,
    private updateUC: UpdateUserUseCase,
    private deleteUC: DeleteUserUseCase,
    private findByIdUC: FindByIdUseCase,
  ) {}

  private toResponse(u: User): UserResponseDTO {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      type: u.type,
      active: u.active,
      creationDate: u.creationDate,
      cpf: u.cpf,
      cnpj: u.cnpj ?? null,
      phone: u.phone,
      address: u.address ?? null,
      city: u.city ?? null,
      state: u.state ?? null,
      zipCode: u.zipCode ?? null,
    };
  }

  // POST /users (público)
  async create(req: Request, res: Response) {
    const created = await this.createUC.execute(req.body);
    return res.status(201).json(this.toResponse(created));
  }

  // PUT /users (logado)
  async update(req: Request, res: Response) {
    const userId = Number((req as any).user?.id);
    const updated = await this.updateUC.execute(userId, req.body);
    return res.json(this.toResponse(updated));
  }

  // DELETE /users (logado)
  async remove(req: Request, res: Response) {
    const userId = Number((req as any).user?.id);
    await this.deleteUC.execute(userId);
    return res.status(204).send();
  }

  // GET /users/me (logado)
  async me(req: Request, res: Response) {
    const userId = Number((req as any).user?.id);
    const me = await this.findByIdUC.execute(userId);
    return res.json(this.toResponse(me));
  }
}