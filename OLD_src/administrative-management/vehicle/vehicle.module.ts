import { Module } from '@nestjs/common';
import { VehicleController } from './presentation/controllers/vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './domain/entities/vehicle.entity';
import { VehicleService } from './domain/services/vehicle.service';
import { UserModule } from '../../auth-and-access/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    UserModule
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService]
})
export class VehicleModule {}