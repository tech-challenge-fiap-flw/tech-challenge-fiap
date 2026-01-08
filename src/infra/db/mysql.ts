import { AsyncLocalStorage } from 'async_hooks';
import mysql, { Pool, ResultSetHeader } from 'mysql2/promise';

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

let pool: Pool | null = null;

const connectionStorage = new AsyncLocalStorage<mysql.PoolConnection>();

export function getPool(): Pool {
  if (!pool) {

    const host = 'tech-challenge-db-staging.crcq28iy2w6l.us-east-1.rds.amazonaws.com';
    const user = 'admin';
    const password = 'Staging#1234!';
    const database = 'tech_challenge_fiap_staging';
    const port = 3306;

    const config: DbConfig = {
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
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

export function getConnection(): mysql.PoolConnection | mysql.Pool {
  const conn = connectionStorage.getStore();

  if (conn) {
    return conn; 
  }

  return getPool();
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const conn = getConnection();

  const [rows] = await conn.execute(sql, params);

  return rows as T[];
}

export async function insertOne(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const conn = getConnection();

  const [result] = await conn.execute(sql, params);

  return result as ResultSetHeader;
}

export async function update(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const conn = getConnection();

  const [result] = await conn.execute(sql, params);

  return result as ResultSetHeader;
}

export async function deleteByField(table: string, field: string, value: any): Promise<ResultSetHeader> {
  const sql = `DELETE FROM \`${table}\` WHERE \`${field}\` = ?`;

  const conn = getConnection();

  const [result] = await conn.execute(sql, [value]);

  return result as ResultSetHeader;
}

export function isTransactionActive(): boolean {
    return !!connectionStorage.getStore();
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  if (isTransactionActive()) {
    return fn();
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  return connectionStorage.run(conn, async () => {
    try {
      await conn.beginTransaction();
      const result = await fn();
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  });
}