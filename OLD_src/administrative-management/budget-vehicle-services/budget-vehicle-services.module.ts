import { Module } from '@nestjs/common';
import { BudgetVehicleServicesService } from './domain/services/budget-vehicle-services.service';

@Module({
  providers: [BudgetVehicleServicesService],
  exports: [BudgetVehicleServicesService],
})
export class BudgetVehicleServicesModule {}
