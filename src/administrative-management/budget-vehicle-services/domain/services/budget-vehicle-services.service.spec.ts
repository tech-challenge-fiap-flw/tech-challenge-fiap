import { Test, TestingModule } from '@nestjs/testing';
import { BudgetVehicleServicesService } from './budget-vehicle-services.service';

describe('BudgetVehicleServicesService', () => {
  let service: BudgetVehicleServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetVehicleServicesService],
    }).compile();

    service = module.get<BudgetVehicleServicesService>(BudgetVehicleServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
