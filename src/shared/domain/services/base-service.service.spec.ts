import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { BaseService } from './base-service.service';

describe('BaseService', () => {
  let dataSourceMock: jest.Mocked<DataSource>;
  let repositoryMock: jest.Mocked<Repository<any>>;
  let queryRunnerMock: jest.Mocked<QueryRunner>;
  let entityMock: Function;
  let service: BaseService<any>;

  beforeEach(() => {
    entityMock = jest.fn();

    repositoryMock = {
      target: entityMock,
    } as any;

    queryRunnerMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {} as EntityManager,
    } as any;

    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(repositoryMock),
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    } as any;

    service = new BaseService(dataSourceMock, entityMock);
  });

  describe('constructor', () => {
    it('deve inicializar repository com dataSource.getRepository', () => {
      expect(dataSourceMock.getRepository).toHaveBeenCalledWith(entityMock);
      expect(service['repository']).toBe(repositoryMock);
    });

    it('deve não inicializar repository se dataSource for undefined', () => {
      const serviceWithoutDS = new BaseService(undefined, entityMock);
      expect(serviceWithoutDS['repository']).toBeUndefined();
    });
  });

  describe('getCurrentRepository', () => {
    it('deve retornar repository do manager se passado', () => {
      const managerMock = {
        getRepository: jest.fn().mockReturnValue(repositoryMock),
      } as unknown as EntityManager;

      const repo = service['getCurrentRepository'](managerMock);
      expect(managerMock.getRepository).toHaveBeenCalledWith(entityMock);
      expect(repo).toBe(repositoryMock);
    });

    it('deve retornar repository padrão se manager não for passado', () => {
      const repo = service['getCurrentRepository']();
      expect(repo).toBe(repositoryMock);
    });
  });

  describe('startTransaction', () => {
    it('deve criar queryRunner e iniciar transação', async () => {
      await service.startTransaction();

      expect(dataSourceMock.createQueryRunner).toHaveBeenCalled();
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(service['queryRunner']).toBe(queryRunnerMock);
    });
  });

  describe('commitTransaction', () => {
    it('deve chamar commitTransaction no queryRunner', async () => {
      service['queryRunner'] = queryRunnerMock;
      await service.commitTransaction();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('rollbackTransaction', () => {
    it('deve chamar rollbackTransaction no queryRunner', async () => {
      service['queryRunner'] = queryRunnerMock;
      await service.rollbackTransaction();
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('deve chamar release no queryRunner', async () => {
      service['queryRunner'] = queryRunnerMock;
      await service.release();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });

  describe('getManager', () => {
    it('deve retornar manager do queryRunner se queryRunner existir', () => {
      service['queryRunner'] = queryRunnerMock;
      expect(service.getManager()).toBe(queryRunnerMock.manager);
    });

    it('deve lançar erro se queryRunner não foi iniciado', () => {
      service['queryRunner'] = undefined;
      expect(() => service.getManager()).toThrowError('Transaction not started.');
    });
  });

  describe('runInTransaction', () => {
    it('deve executar callback e fazer commit e release', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      // Mock dos métodos que runInTransaction chama
      const startSpy = jest.spyOn(service, 'startTransaction');
      const commitSpy = jest.spyOn(service, 'commitTransaction');
      const rollbackSpy = jest.spyOn(service, 'rollbackTransaction');
      const releaseSpy = jest.spyOn(service, 'release');
      jest.spyOn(service, 'getManager').mockReturnValue(queryRunnerMock.manager);

      const result = await service.runInTransaction(callback);

      expect(startSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(queryRunnerMock.manager);
      expect(commitSpy).toHaveBeenCalled();
      expect(releaseSpy).toHaveBeenCalled();
      expect(rollbackSpy).not.toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('deve chamar rollback e release se callback lançar erro', async () => {
      const error = new Error('fail');
      const callback = jest.fn().mockRejectedValue(error);

      jest.spyOn(service, 'startTransaction');
      jest.spyOn(service, 'commitTransaction');
      const rollbackSpy = jest.spyOn(service, 'rollbackTransaction');
      const releaseSpy = jest.spyOn(service, 'release');
      jest.spyOn(service, 'getManager').mockReturnValue(queryRunnerMock.manager);

      await expect(service.runInTransaction(callback)).rejects.toThrow(error);

      expect(rollbackSpy).toHaveBeenCalled();
      expect(releaseSpy).toHaveBeenCalled();
    });
  });

  describe('transactional', () => {
    it('deve chamar operação diretamente se passar manager', async () => {
      const manager = {} as EntityManager;
      const operation = jest.fn().mockResolvedValue('done');

      const result = await service.transactional(operation, manager);

      expect(operation).toHaveBeenCalledWith(manager);
      expect(result).toBe('done');
    });

    it('deve chamar runInTransaction se não passar manager', async () => {
      const operation = jest.fn().mockResolvedValue('done');
      const runSpy = jest.spyOn(service, 'runInTransaction');

      const result = await service.transactional(operation);

      expect(runSpy).toHaveBeenCalledWith(operation);
      expect(result).toBe('done');
    });
  });
});
