import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePart } from '../entities/vehicle-part.entity';
import { CreateVehiclePartDto } from '../../presentation/dto/create-vehicle-part.dto';
import { VehiclePartResponseDto } from '../../presentation/dto/vehicle-part-response.dto';

@Injectable()
export class VehiclePartService {
  constructor(
    @InjectRepository(VehiclePart)
    private vehiclePartRepository: Repository<VehiclePart>
  ) {}

  async create(createDto: CreateVehiclePartDto): Promise<VehiclePartResponseDto> {
    return this.vehiclePartRepository.save(createDto);
  }
}
