import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiagnosisDto } from '../../presentation/dto/create-diagnosis.dto';
import { VehicleService } from '../../../../administrative-management/vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { Diagnosis } from '../entities/diagnosis.entity';
import { UpdateDiagnosisDto } from '../../presentation/dto/update-diagnosis.dto';
import { BaseService } from 'src/shared/domain/services/base-service.service';
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

  async findAllByVehicleId(vehicleId: number): Promise<Diagnosis[]> {
    const diagnostics = await this.repository.find({
      where: { vehicleId },
    });

    if (!diagnostics.length) {
      throw new NotFoundException(`Diagnostics with vehicle Id ${vehicleId} not found`);
    }

    return diagnostics;
  }

  async findById(id: number, manager?: EntityManager): Promise<Diagnosis> {
    const diagnosis = await this.getCurrentRepository(manager).findOneBy({ id });

    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
    }

    return diagnosis;
  }

  async update(id: number, data: UpdateDiagnosisDto): Promise<Diagnosis> {
    await this.vehicleService.findById(data.vehicleId)
    await this.userService.findById(data.responsibleMechanicId)

    const diagnosis = await this.findById(id);

    Object.assign(diagnosis, data);
    return this.repository.save(diagnosis);
  }

  async remove(id: number): Promise<void> {
    const diagnosis = await this.findById(id);
    await this.repository.softRemove(diagnosis);
  }
}
