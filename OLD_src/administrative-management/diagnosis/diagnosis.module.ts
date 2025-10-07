import { Module } from '@nestjs/common';
import { DiagnosisService } from './domain/services/diagnosis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from '../vehicle/vehicle.module';
import { UserModule } from '../../auth-and-access/user/user.module';
import { Diagnosis } from './domain/entities/diagnosis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diagnosis]),
    VehicleModule,
    UserModule
  ],
  providers: [DiagnosisService],
  exports: [DiagnosisService]
})
export class DiagnosisModule {}
