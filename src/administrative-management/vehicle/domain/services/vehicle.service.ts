import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../../presentation/dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { UpdateVehicleDto } from '../../presentation/dto/update-vehicle.dto';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly userService: UserService
  ) {}

  async create(createDto: CreateVehicleDto): Promise<Vehicle> {
    await this.userService.findById(createDto.ownerId)
    return this.vehicleRepository.save(createDto);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      loadEagerRelations: false,
    });
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      loadEagerRelations: false,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    return vehicle;
  }

  async update(id: number, data: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    Object.assign(vehicle, data);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<void> {
    const vehicle = await this.findById(id);
    await this.vehicleRepository.softRemove(vehicle);
  }
}
