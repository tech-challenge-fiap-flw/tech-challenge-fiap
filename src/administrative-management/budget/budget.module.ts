import { Module } from '@nestjs/common';
import { BudgetService } from './domain/services/budget.service';
import { BudgetController } from './presentation/controllers/budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './domain/entities/budget.entity';
import { DiagnosisModule } from '../../administrative-management/diagnosis/diagnosis.module';
import { VehiclePartModule } from '../../administrative-management/vehicle-part/vehicle-part.module';
import { BudgetVehiclePartModule } from '../../administrative-management/budget-vehicle-part/budget-vehicle-part.module';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../../auth-and-access/user/user.module';
import { ServiceOrderHistoryModule } from 'src/service-order-history/service-order-history.module';
import { VehicleServiceModule } from '../vehicle-service/vehicle-service.module';
import { BudgetVehicleServicesModule } from 'src/administrative-management/budget-vehicle-services/budget-vehicle-services.module';

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
