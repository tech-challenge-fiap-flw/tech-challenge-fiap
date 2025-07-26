import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiagnosisDto } from '../../presentation/dto/create-diagnosis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleService } from '../../../../administrative-management/vehicle/domain/services/vehicle.service';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisResponseDto } from '../../presentation/dto/diagnosis-response.dto';
import { UpdateDiagnosisDto } from '../../presentation/dto/update-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    private readonly vehicleService: VehicleService,
    private readonly userService: UserService
  ) {}

  async create(data: CreateDiagnosisDto): Promise<DiagnosisResponseDto> {
    if (!(await this.vehicleService.findById(data.vehicleId))) {
      throw new NotFoundException('Veiculo não encontrado')
    }

    if (!(await this.userService.findById(data.responsibleMechanicId))) {
      throw new NotFoundException('Responsável não encontrado')
    }

    return this.diagnosisRepository.save(data);
  }

  async findAllByVehicleId(vehicleId: number): Promise<DiagnosisResponseDto[]> {
    const diagnostics = await this.diagnosisRepository.find({
      where: { vehicleId },
    });

    if (!diagnostics.length) {
      throw new NotFoundException(`Diagnostics with vehicle Id ${vehicleId} not found`);
    }

    return diagnostics;
  }

  async findById(id: number): Promise<DiagnosisResponseDto> {
    const diagnosis = await this.diagnosisRepository.findOneBy({ id });

    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
    }

    return diagnosis;
  }

  async update(id: number, data: UpdateDiagnosisDto): Promise<DiagnosisResponseDto> {
    if (!(await this.vehicleService.findById(data.vehicleId))) {
      throw new NotFoundException('Veiculo não encontrado')
    }

    if (!(await this.userService.findById(data.responsibleMechanicId))) {
      throw new NotFoundException('Responsável não encontrado')
    }

    const diagnosis = await this.findById(id);
    Object.assign(diagnosis, data);
    return this.diagnosisRepository.save(diagnosis);
  }

  async remove(id: number): Promise<void> {
    const diagnosis = await this.findById(id);
    await this.diagnosisRepository.softRemove(diagnosis);
  }
}
