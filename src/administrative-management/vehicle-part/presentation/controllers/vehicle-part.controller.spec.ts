import { Test, TestingModule } from '@nestjs/testing';
import { VehiclePartController } from './vehicle-part.controller';
import { VehiclePartService } from '../../domain/services/vehicle-part.service';

describe('VehiclePartController', () => {
  let controller: VehiclePartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclePartController],
      providers: [VehiclePartService],
    }).compile();

    controller = module.get<VehiclePartController>(VehiclePartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
