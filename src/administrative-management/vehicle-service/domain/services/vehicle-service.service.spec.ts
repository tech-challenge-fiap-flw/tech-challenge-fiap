import { Test, TestingModule } from '@nestjs/testing';
import { VehicleServiceService } from '../../vehicle-service.service';

describe('VehicleServiceService', () => {
  let service: VehicleServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleServiceService],
    }).compile();

    service = module.get<VehicleServiceService>(VehicleServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
