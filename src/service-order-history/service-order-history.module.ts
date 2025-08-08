import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceOrderHistory, ServiceOrderHistorySchema } from './schema/service-order-history.schema';
import { ServiceOrderHistoryService } from './service-order-history.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ServiceOrderHistory.name, schema: ServiceOrderHistorySchema }])],
  providers: [ServiceOrderHistoryService],
  exports: [ServiceOrderHistoryService],
})
export class ServiceOrderHistoryModule {}
