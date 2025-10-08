import { User } from '../../domain/entities/user';
import { UserResponseDto } from '../http/dto/user-response.dto';

export class UserPresenter {
  static toResponse(u: User): UserResponseDto {
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
      zipCode: u.zipCode ?? null
    };
  }
}
