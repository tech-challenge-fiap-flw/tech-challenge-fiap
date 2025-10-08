import { UserEntity, UserId } from './User';

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: UserId): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(id: UserId, partial: Partial<UserEntity['toJSON'] extends () => infer T ? T : never>): Promise<UserEntity>;
  softDelete(id: UserId): Promise<void>;
  list(offset: number, limit: number): Promise<UserEntity[]>;
  countAll(): Promise<number>;
}
