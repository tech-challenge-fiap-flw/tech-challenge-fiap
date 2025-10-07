import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';

export class BaseService<T> {
  protected queryRunner: QueryRunner;
  protected repository: Repository<T>;

  constructor(protected readonly dataSource: DataSource, entity: Function) {
    if (!dataSource) {
      return;
    }

    this.repository = this.dataSource.getRepository<T>(entity);
  }

  protected getCurrentRepository(manager?: EntityManager): Repository<T> {
    if (manager) {
      return manager.getRepository<T>(this.repository.target as Function);
    }

    return this.repository;
  }

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

  async runInTransaction<R>(
    callback: (manager: QueryRunner['manager']) => Promise<R>,
  ): Promise<R> {
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

  async transactional<R>(operation: (manager: EntityManager) => Promise<R>, manager?: EntityManager): Promise<R> {
    if (manager) {
      return operation(manager);
    } else {
      return this.runInTransaction(operation);
    }
  }
}
