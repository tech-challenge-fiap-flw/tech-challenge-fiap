import { Module } from '@nestjs/common';
import { VehiclePartService } from './domain/services/vehicle-part.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclePart } from './domain/entities/vehicle-part.entity';
import { VehiclePartController } from './presentation/controllers/vehicle-part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehiclePart])],
  controllers: [VehiclePartController],
  providers: [VehiclePartService],
  exports: [VehiclePartService]
})
export class VehiclePartModule {}