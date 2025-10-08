import { IUserRepository } from './IUserRepository';
import { User } from '../domain/User';
import { prisma } from '../../../prisma/client';

function map(db: any): User {
  return new User({
    id: db.id,
    name: db.name,
    email: db.email,
    password: db.password,
    type: db.type,
    active: db.active,
    creationDate: db.creationDate,
    cpf: db.cpf,
    cnpj: db.cnpj,
    phone: db.phone,
    address: db.address,
    city: db.city,
    state: db.state,
    zipCode: db.zipCode,
  });
}

export class PrismaUserRepository implements IUserRepository {
  async create(data: any): Promise<User> {
    const created = await prisma.user.create({ data });
    return map(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({ where: { email } });
    return found ? map(found) : null;
  }

  async findById(id: number): Promise<User | null> {
    const found = await prisma.user.findUnique({ where: { id } });
    return found ? map(found) : null;
  }

  async update(id: number, data: any): Promise<User> {
    const updated = await prisma.user.update({ where: { id }, data });
    return map(updated);
  }

  async deactivate(id: number): Promise<void> {
    await prisma.user.update({ where: { id }, data: { active: false } });
  }
}