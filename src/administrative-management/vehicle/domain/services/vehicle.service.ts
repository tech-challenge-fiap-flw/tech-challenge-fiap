import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../../presentation/dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CustomerService } from '../../../customer/domain/services/customer.service';
import { VehicleResponseDto } from '../../presentation/dto/vehicle-response.dto';
import { UpdateVehicleDto } from '../../presentation/dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly customerService: CustomerService
  ) {}

  async create(createDto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const owner = await this.customerService.findOne(createDto.ownerId);

    if (!owner) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return this.vehicleRepository.save(createDto);
  }

  async findAll(): Promise<VehicleResponseDto[]> {
    return this.vehicleRepository.find({
      loadEagerRelations: false,
    });
  }

  async findById(id: number): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      loadEagerRelations: false,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    return vehicle;
  }

  async update(id: number, data: UpdateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.findById(id);
    Object.assign(vehicle, data);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<void> {
    const vehicle = await this.findById(id);
    await this.vehicleRepository.softRemove(vehicle);
  }
}
