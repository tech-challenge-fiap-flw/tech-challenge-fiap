import { Test, TestingModule } from '@nestjs/testing';
import { VehiclePartService } from './vehicle-part.service';

describe('VehiclePartService', () => {
  let service: VehiclePartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiclePartService],
    }).compile();

    service = module.get<VehiclePartService>(VehiclePartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
