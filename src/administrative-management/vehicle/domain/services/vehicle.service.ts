import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from '../../presentation/dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CustomerService } from '../../../customer/domain/services/customer.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly customerService: CustomerService
  ) {}

  async create(createDto: CreateVehicleDto): Promise<Vehicle> {
    const owner = await this.customerService.findOne(createDto.ownerId);
    if (!owner) throw new NotFoundException('Usuário não encontrado');

    const vehicle = this.vehicleRepository.create({
      ...createDto,
      owner,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<Vehicle> {
    const customer = await this.vehicleRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const customer = await this.findOne(id);
    Object.assign(customer, data);
    return this.vehicleRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.vehicleRepository.softRemove(customer);
  }
}
