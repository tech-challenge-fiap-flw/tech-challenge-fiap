import { Module } from '@nestjs/common';
import { ServiceOrderService } from './domain/services/service-order.service';
import { ServiceOrderController } from './presentation/controllers/service-order.controller';
import { ServiceOrder } from './domain/entities/service-order.entity';
import { ServiceOrderHistoryModule } from 'src/administrative-management/service-order-history/service-order-history.module';
import { UserModule } from 'src/auth-and-access/user/user.module';
import { BudgetModule } from 'src/administrative-management/budget/budget.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisModule } from 'src/administrative-management/diagnosis/diagnosis.module';
import { BudgetVehiclePartModule } from '../budget-vehicle-part/budget-vehicle-part.module';
import { VehiclePartModule } from '../vehicle-part/vehicle-part.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder]),
    UserModule,
    BudgetModule,
    ServiceOrderHistoryModule,
    DiagnosisModule,
    BudgetVehiclePartModule,
    VehiclePartModule,
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
})
export class ServiceOrderModule {}