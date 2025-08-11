import { Test, TestingModule } from '@nestjs/testing';
import { BudgetVehicleServicesController } from './budget-vehicle-services.controller';
import { BudgetVehicleServicesService } from './budget-vehicle-services.service';

describe('BudgetVehicleServicesController', () => {
  let controller: BudgetVehicleServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetVehicleServicesController],
      providers: [BudgetVehicleServicesService],
    }).compile();

    controller = module.get<BudgetVehicleServicesController>(BudgetVehicleServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
