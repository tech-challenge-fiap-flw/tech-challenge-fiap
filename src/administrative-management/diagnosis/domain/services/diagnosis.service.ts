import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiagnosisDto } from '../../presentation/dto/create-diagnosis.dto';
import { VehicleService } from '../../../../administrative-management/vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { Diagnosis } from '../entities/diagnosis.entity';
import { BaseService } from '../../../../shared/domain/services/base-service.service';
import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DiagnosisService extends BaseService<Diagnosis> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,

    private readonly vehicleService: VehicleService,
    private readonly userService: UserService
  ) {
    super(dataSource, Diagnosis);
  }

  async create(data: CreateDiagnosisDto, manager?: EntityManager): Promise<Diagnosis> {
    const response = await this.transactional(async (manager) => {
      await this.vehicleService.findById(data.vehicleId)
      await this.userService.findById(data.responsibleMechanicId)

      return manager.getRepository(Diagnosis).save(data);
    }, manager);

    return response;
  }

  async findById(id: number, manager?: EntityManager): Promise<Diagnosis> {
    const diagnosis = await this.getCurrentRepository(manager).findOneBy({ id });

    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
    }

    return diagnosis;
  }
}
