import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../../../infra/db/mysql';
import { UserEntity, UserId, UserProps } from '../domain/User';
import { UserRepository } from '../domain/UserRepository';

export class UserMySqlRepository implements UserRepository {
  async create(user: UserEntity): Promise<UserEntity> {
    const data = user.toJSON();
    
    const sql = `INSERT INTO users (name, email, password, type, active, creationDate, cpf, cnpj, phone, address, city, state, zipCode)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                 
    const params = [
      data.name,
      data.email,
      data.password,
      data.type,
      data.active,
      data.creationDate,
      data.cpf,
      data.cnpj ?? null,
      data.phone,
      data.address ?? null,
      data.city ?? null,
      data.state ?? null,
      data.zipCode ?? null,
    ];

    const results = await query<ResultSetHeader>(sql, params);
    const id = results.at(0)?.insertId as UserId;
    
    return UserEntity.restore({ ...data, id });
  }

  async findById(id: UserId): Promise<UserEntity | null> {
    const rows = await query<UserProps & RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return UserEntity.restore(rows[0]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const rows = await query<UserProps & RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return UserEntity.restore(rows[0]);
  }

  async update(id: UserId, partial: Partial<UserProps>): Promise<UserEntity> {
    const keys = Object.keys(partial) as (keyof UserProps)[];

    if (keys.length === 0) {
      const found = await this.findById(id);
      
      if (!found) {
        throw Object.assign(new Error('User not found'), { status: 404 });
      }
      
      return found;
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const params = keys.map((k) => (partial as any)[k]);
    params.push(id);

    await query<ResultSetHeader>(`UPDATE users SET ${setClause} WHERE id = ?`, params);
    
    const updated = await this.findById(id);
    
    if (!updated) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }
    
    return updated;
  }

  async softDelete(id: UserId): Promise<void> {
    await query<ResultSetHeader>(`UPDATE users SET active = 0 WHERE id = ?`, [id]);
  }

  async list(offset: number, limit: number): Promise<UserEntity[]> {
    const rows = await query<UserProps & RowDataPacket[]>(
      `SELECT * FROM users WHERE active = 1 ORDER BY id LIMIT ? OFFSET ?`, 
      [limit, offset]
    );
    
    return rows.map((r) => UserEntity.restore(r));
  }

  async countAll(): Promise<number> {
    const rows = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM users WHERE active = 1`);
    
    return Number(rows.at(0)?.c ?? 0);
  }
}