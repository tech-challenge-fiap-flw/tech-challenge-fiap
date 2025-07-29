import { Test, TestingModule } from '@nestjs/testing';
import { BudgetVehiclePartService } from '../../budget-vehicle-part.service';

describe('BudgetVehiclePartService', () => {
  let service: BudgetVehiclePartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetVehiclePartService],
    }).compile();

    service = module.get<BudgetVehiclePartService>(BudgetVehiclePartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
