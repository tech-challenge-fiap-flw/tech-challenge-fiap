import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

export class BaseService {
  protected queryRunner: QueryRunner;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async startTransaction(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }

  async release(): Promise<void> {
    await this.queryRunner.release();
  }

  getManager() {
    if (!this.queryRunner) {
      throw new Error('Transaction not started.');
    }
    return this.queryRunner.manager;
  }

  async runInTransaction<T>(callback: (manager: QueryRunner['manager']) => Promise<T>): Promise<T> {
    await this.startTransaction();
    try {
      const result = await callback(this.getManager());
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    } finally {
      await this.release();
    }
  }
}
