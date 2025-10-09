import bcrypt from 'bcrypt';
import { UserEntity } from '../domain/User';
import { IUserRepository } from '../domain/IUserRepository';

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

export interface IUserService {
  createUser(input: CreateUserInput): Promise<UserOutput>;
  updateUser(id: number, partial: Partial<CreateUserInput>): Promise<UserOutput>;
  deleteUser(id: number): Promise<void>;
  findById(id: number): Promise<UserOutput | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  list(offset: number, limit: number): Promise<UserOutput[]>;
  countAll(): Promise<number>;
}

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}

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

  async findById(id: number): Promise<UserOutput | null> {
    const user = await this.repo.findById(id);

    if (!user) {
      return null;
    }

    const { password, ...rest } = user.toJSON();

    return rest as UserOutput;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findByEmail(email);
  }

  async list(offset: number, limit: number): Promise<UserOutput[]> {
    const items = await this.repo.list(offset, limit);

    return items.map(i => {
      const { password, ...rest } = i.toJSON();

      return rest as UserOutput;
    });
  }

  async countAll(): Promise<number> {
    return this.repo.countAll();
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
