import { CreateUserDTO } from './CreateUserDTO';
export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'password'>>;