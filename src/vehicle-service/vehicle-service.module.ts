import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleServiceService } from './vehicle-service.service';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehiclePart } from 'src/administrative-management/vehicle-part/domain/entities/vehicle-part.entity';
import { VehiclePartModule } from 'src/administrative-management/vehicle-part/vehicle-part.module';
import { VehicleService } from 'src/administrative-management/vehicle/domain/services/vehicle.service';

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
