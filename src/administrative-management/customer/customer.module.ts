import { Module } from '@nestjs/common';
import { Customer } from './domain/entities/customer.entity';
import { CustomerService } from './domain/services/customer.service';
import { CustomerController } from './presentation/controllers/customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService]
})
export class CustomerModule {}