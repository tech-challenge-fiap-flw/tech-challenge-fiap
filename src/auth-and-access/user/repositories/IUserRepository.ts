import { User } from '../domain/User';

export interface IUserRepository {
  create(data: Omit<User, 'id' | 'creationDate' | 'active'> & { active?: boolean; creationDate?: Date }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  update(id: number, data: Partial<Omit<User, 'id' | 'email' | 'creationDate'>>): Promise<User>;
  deactivate(id: number): Promise<void>;
}