import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../../presentation/dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { UpdateVehicleDto } from '../../presentation/dto/update-vehicle.dto';
import { UserService } from '../../../../auth-and-access/user/domain/services/user.service';
import { UserFromJwt } from '../../../../auth-and-access/auth/domain/models/UserFromJwt';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly userService: UserService
  ) {}

  async create(user: UserFromJwt, createDto: CreateVehicleDto): Promise<Vehicle> {
    let newCreateDto = createDto;

    if (user.roles.includes('admin')) {
      await this.userService.findById(createDto.ownerId);
      newCreateDto.ownerId = createDto.ownerId;
    } else {
      newCreateDto.ownerId = user.id;
    }

    return this.vehicleRepository.save(newCreateDto);
  }

  async findAll(user: UserFromJwt): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: 
        user.roles.includes('admin')
          ? {}
          : { ownerId: user.id },
      loadEagerRelations: false,
    });
  }

  async findById(id: number, user?: UserFromJwt): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: user?.roles.includes('admin') || !user
        ? { id }
        : { id, ownerId: user.id },
      loadEagerRelations: false,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    return vehicle;
  }

  async update(user: UserFromJwt, id: number, data: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findById(id, user);
    Object.assign(vehicle, data);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(user: UserFromJwt, id: number): Promise<void> {
    const vehicle = await this.findById(id, user);
    await this.vehicleRepository.softRemove(vehicle);
  }
}
