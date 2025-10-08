import { prisma } from '../../../../../shared/prisma/client';
import { UserRepositoryPort } from '../../../domain/repositories/user.repository.port';
import { User } from '../../../domain/entities/user';

export class PrismaUserRepository implements UserRepositoryPort {
  async create(data: Omit<User, 'id'>): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        type: data.type,
        active: data.active,
        creationDate: data.creationDate,
        cpf: data.cpf,
        cnpj: data.cnpj ?? null,
        phone: data.phone ?? '',
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zipCode: data.zipCode ?? null
      }
    });
    return this.map(created);
  }

  async findById(id: number): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? this.map(u) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    return u ? this.map(u) : null;
  }

  async update(id: number, data: Partial<Omit<User, 'id' | 'creationDate'>>): Promise<User> {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        cpf: data.cpf,
        cnpj: data.cnpj ?? undefined,
        phone: data.phone,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        state: data.state ?? undefined,
        zipCode: data.zipCode ?? undefined
      }
    });
    return this.map(updated);
  }

  async softDelete(id: number): Promise<void> {
    await prisma.user.update({ where: { id }, data: { active: false } });
  }

  private map(row: any): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.password,
      row.type,
      row.active,
      row.creationDate,
      row.cpf,
      row.cnpj,
      row.phone,
      row.address,
      row.city,
      row.state,
      row.zipCode
    );
  }
}
