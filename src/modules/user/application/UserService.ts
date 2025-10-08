import bcrypt from 'bcrypt';
import { UserEntity } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  type: string;
  cpf: string;
  cnpj?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
};

export type UserOutput = Omit<ReturnType<UserEntity['toJSON']>, 'password'>;

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<UserOutput> {
    const exists = await this.repo.findByEmail(input.email);
    if (exists) {
      const error: any = new Error('Email already exists');
      error.status = 400;
      throw error;
    }
    const hashedPassword = await this.hashPassword(input.password);
    const entity = UserEntity.create({ ...input, password: hashedPassword });
    const created = await this.repo.create(entity);
    const { password, ...rest } = created.toJSON();
    return rest as UserOutput;
  }

  async updateUser(id: number, partial: Partial<CreateUserInput>): Promise<UserOutput> {
    if (partial.password) {
      partial.password = await this.hashPassword(partial.password);
    }
    const updated = await this.repo.update(id, partial as any);
    const { password, ...rest } = updated.toJSON();
    return rest as UserOutput;
  }

  async deleteUser(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
