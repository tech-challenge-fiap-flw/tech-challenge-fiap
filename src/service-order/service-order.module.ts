import { Module } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrder } from './entities/service-order.entity';
import { ServiceOrderHistoryModule } from 'src/service-order-history/service-order-history.module';
import { UserModule } from 'src/auth-and-access/user/user.module';
import { BudgetModule } from 'src/administrative-management/budget/budget.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceOrder]),
    UserModule,
    BudgetModule,
    ServiceOrderHistoryModule,
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
})
export class ServiceOrderModule {}
