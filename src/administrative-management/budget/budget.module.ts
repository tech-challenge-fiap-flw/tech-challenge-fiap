import { Module } from '@nestjs/common';
import { BudgetService } from './domain/services/budget.service';
import { BudgetController } from './presentation/controllers/budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './domain/entities/budget.entity';
import { CustomerModule } from '../../administrative-management/customer/customer.module';
import { DiagnosisModule } from '../../administrative-management/diagnosis/diagnosis.module';
import { VehiclePartModule } from '../../administrative-management/vehicle-part/vehicle-part.module';
import { BudgetVehiclePartModule } from '../../administrative-management/budget-vehicle-part/budget-vehicle-part.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget]),
    CustomerModule,
    DiagnosisModule,
    VehiclePartModule,
    BudgetVehiclePartModule,
    SharedModule
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService]
})
export class BudgetModule {}
