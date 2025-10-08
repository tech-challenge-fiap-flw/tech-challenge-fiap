import { User } from '../entities/user';

export interface UserRepositoryPort {
  create(data: Omit<User, 'id' | 'creationDate' | 'active'> & Partial<Pick<User,'active'|'creationDate'>>): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, data: Partial<Omit<User, 'id' | 'creationDate'>>): Promise<User>;
  softDelete(id: number): Promise<void>;
}
