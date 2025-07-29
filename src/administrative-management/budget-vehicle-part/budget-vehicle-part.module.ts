import { Module } from '@nestjs/common';
import { BudgetVehiclePartService } from './domain/services/budget-vehicle-part.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetVehiclePart } from './domain/entities/budget-vehicle-part.entity';
import { VehiclePartModule } from '../../administrative-management/vehicle-part/vehicle-part.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BudgetVehiclePart]),
    VehiclePartModule
  ],
  providers: [BudgetVehiclePartService],
  exports: [BudgetVehiclePartService]
})
export class BudgetVehiclePartModule {}