import { DataSource, EntityManager, Repository, DeepPartial } from 'typeorm';
import { BudgetVehicleServicesService } from './budget-vehicle-services.service';
import { BudgetVehicleServices } from '../entities/budget-vehicle-services.entity';
import { CreateBudgetVehicleServiceDto } from '../../presentation/dto/create-budget-vehicle-service.dto';

describe('BudgetVehicleServicesService', () => {
  let service: BudgetVehicleServicesService;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockRepository: jest.Mocked<Repository<BudgetVehicleServices>>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockManager = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    service = new BudgetVehicleServicesService(mockDataSource);

    // Mocka o transactional para chamar direto a função passada
    jest
      .spyOn(service, 'transactional')
      .mockImplementation((operation: any) => operation(mockManager));
  });

  it('deve criar e salvar entidades corretamente', async () => {
    const dto: CreateBudgetVehicleServiceDto = {
      budgetId: 1,
      vehicleServices: [10, 20],
    };

    const createdEntities: DeepPartial<BudgetVehicleServices>[] = [
      { budgetId: 1, vehicleServiceId: 10 },
      { budgetId: 1, vehicleServiceId: 20 },
    ];

    mockRepository.create
      .mockReturnValueOnce(createdEntities[0] as BudgetVehicleServices)
      .mockReturnValueOnce(createdEntities[1] as BudgetVehicleServices);

    mockRepository.save.mockResolvedValue(createdEntities as any);

    const result = await service.create(dto);

    expect(mockRepository.create).toHaveBeenCalledTimes(2);
    expect(mockRepository.create).toHaveBeenCalledWith({
      budgetId: dto.budgetId,
      vehicleServiceId: 10,
    });
    expect(mockRepository.create).toHaveBeenCalledWith({
      budgetId: dto.budgetId,
      vehicleServiceId: 20,
    });

    expect(mockRepository.save).toHaveBeenCalledWith([
      createdEntities[0],
      createdEntities[1],
    ]);
    expect(result).toEqual(createdEntities);
  });

  it('deve propagar erro se save falhar', async () => {
    const dto: CreateBudgetVehicleServiceDto = {
      budgetId: 1,
      vehicleServices: [10],
    };

    mockRepository.create.mockReturnValue({} as BudgetVehicleServices);
    mockRepository.save.mockRejectedValue(new Error('DB error'));

    await expect(service.create(dto)).rejects.toThrow('DB error');
  });
});
