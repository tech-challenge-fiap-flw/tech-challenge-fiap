import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiagnosisDto } from '../../presentation/dto/create-diagnosis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleService } from '../../../../administrative-management/vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { Diagnosis } from '../entities/diagnosis.entity';
import { UpdateDiagnosisDto } from '../../presentation/dto/update-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    private readonly vehicleService: VehicleService,
    private readonly userService: UserService
  ) {}

  async create(data: CreateDiagnosisDto): Promise<Diagnosis> {
    await this.vehicleService.findById(data.vehicleId)
    await this.userService.findById(data.responsibleMechanicId)

    return this.diagnosisRepository.save(data);
  }

  async findAllByVehicleId(vehicleId: number): Promise<Diagnosis[]> {
    const diagnostics = await this.diagnosisRepository.find({
      where: { vehicleId },
    });

    if (!diagnostics.length) {
      throw new NotFoundException(`Diagnostics with vehicle Id ${vehicleId} not found`);
    }

    return diagnostics;
  }

  async findById(id: number): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });

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
    return this.diagnosisRepository.save(diagnosis);
  }

  async remove(id: number): Promise<void> {
    const diagnosis = await this.findById(id);
    await this.diagnosisRepository.softRemove(diagnosis);
  }
}
