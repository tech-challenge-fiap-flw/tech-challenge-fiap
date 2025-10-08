import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { PasswordService } from '../../../../shared/security/password.service';
import { User } from '../../domain/entities/user';

type Input = {
  name: string;
  email: string;
  password: string;
  type: string;
  cpf?: string;
  cnpj?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
};

export class CreateUserUseCase {
  constructor(private repo: UserRepositoryPort) {}

  async execute(data: Input): Promise<User> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      const err: any = new Error('Email already exists');
      err.status = 400;
      throw err;
    }

    const hashed = await PasswordService.hash(data.password);

    return this.repo.create({
      name: data.name,
      email: data.email,
      password: hashed,
      type: data.type,
      active: true,
      creationDate: new Date(),
      cpf: data.cpf!,
      cnpj: data.cnpj ?? null,
      phone: data.phone,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zipCode: data.zipCode ?? null
    });
  }
}
