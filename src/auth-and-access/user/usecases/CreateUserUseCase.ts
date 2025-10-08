import { IUserRepository } from '../repositories/IUserRepository';
import ConflictRequest from '../../../errors/ConflictRequest';
import { CreateUserDTO, validateCreateUserDTO } from '../dtos/CreateUserDTO';
import * as bcrypt from 'bcrypt';

export class CreateUserUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(dto: CreateUserDTO) {
    console.log('Tentando criar usuário com email:', dto.email);

    validateCreateUserDTO(dto);

    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new ConflictRequest('Email already exists');

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(dto.password, salt);

    const user = await this.repo.create({
      name: dto.name,
      email: dto.email,
      password,
      type: dto.type,
      active: true,
      creationDate: new Date(),
      cpf: dto.cpf ?? '',
      cnpj: dto.cnpj ?? null,
      phone: dto.phone,
      address: dto.address ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      zipCode: dto.zipCode ?? null,
    });

    return user;
  }
}