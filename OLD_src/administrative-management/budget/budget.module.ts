import { Module } from '@nestjs/common';
import { BudgetService } from './domain/services/budget.service';
import { BudgetController } from './presentation/controllers/budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './domain/entities/budget.entity';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { VehiclePartModule } from '../vehicle-part/vehicle-part.module';
import { BudgetVehiclePartModule } from '../budget-vehicle-part/budget-vehicle-part.module';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../../auth-and-access/user/user.module';
import { ServiceOrderHistoryModule } from '../service-order-history/service-order-history.module';
import { VehicleServiceModule } from '../vehicle-service/vehicle-service.module';
import { BudgetVehicleServicesModule } from '../budget-vehicle-services/budget-vehicle-services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget]),
    UserModule,
    DiagnosisModule,
    VehiclePartModule,
    BudgetVehiclePartModule,
    ServiceOrderHistoryModule,
    SharedModule,
    VehicleServiceModule,
    BudgetVehicleServicesModule
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService]
})
export class BudgetModule {}
