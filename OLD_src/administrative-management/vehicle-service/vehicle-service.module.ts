import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleServiceService } from './domain/services/vehicle-service.service';
import { VehicleServiceController } from './presentation/controllers/vehicle-service.controller';
import { VehiclePart } from '../vehicle-part/domain/entities/vehicle-part.entity';
import { VehiclePartModule } from '../vehicle-part/vehicle-part.module';
import { VehicleService } from '../vehicle/domain/services/vehicle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehicleService, VehiclePart]),
    VehiclePartModule
  ],
  providers: [VehicleServiceService],
  controllers: [VehicleServiceController],
  exports: [VehicleServiceService]
})
export class VehicleServiceModule {}
