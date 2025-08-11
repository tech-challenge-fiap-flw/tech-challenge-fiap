import { Test, TestingModule } from '@nestjs/testing';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from './vehicle-service.service';

describe('VehicleServiceController', () => {
  let controller: VehicleServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleServiceController],
      providers: [VehicleServiceService],
    }).compile();

    controller = module.get<VehicleServiceController>(VehicleServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
