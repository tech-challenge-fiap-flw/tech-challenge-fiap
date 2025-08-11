import { Module } from '@nestjs/common';
import { BudgetVehicleServicesService } from './budget-vehicle-services.service';

@Module({
  providers: [BudgetVehicleServicesService],
  exports: [BudgetVehicleServicesService],
})
export class BudgetVehicleServicesModule {}
