import mysql, { Pool, ResultSetHeader } from 'mysql2/promise';

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const config: DbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'tech_challenge',
    };

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function insertOne(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as ResultSetHeader;
}

export async function update(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as ResultSetHeader;
}

export async function deleteByField(table: string, field: string, value: any): Promise<ResultSetHeader> {
  const sql = `DELETE FROM \`${table}\` WHERE \`${field}\` = ?`;
  const [result] = await getPool().execute(sql, [value]);
  return result as ResultSetHeader;
}