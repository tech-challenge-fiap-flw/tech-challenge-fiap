import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { CreateVehicleServiceDto } from '../../presentation/dto/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from '../../presentation/dto/update-vehicle-service.dto';
import { BaseService } from '../../../../shared/domain/services/base-service.service';
import { VehicleService } from '../entities/vehicle-service.entity';

@Injectable()
export class VehicleServiceService extends BaseService<VehicleService> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource
  ) {
    super(dataSource, VehicleService);
  }

  async create(createVehicleServiceDto: CreateVehicleServiceDto, manager?: EntityManager): Promise<VehicleService> {
    return this.transactional(async (manager) => {
      const { name, description, price } = createVehicleServiceDto;

      const vehicleServiceRepo = manager.getRepository(VehicleService);

      const vehicleService = vehicleServiceRepo.create({
        name,
        description,
        price
      });

      return await vehicleServiceRepo.save(vehicleService);
    }, manager);
  }

  async findByIds(ids: number[]): Promise<VehicleService[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.repository.find({ where: { id: In(ids) } });
  }

  async findAll(): Promise<VehicleService[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<VehicleService> {
    const vehicleService = await this.repository.findOne({ where: { id } });

    if (!vehicleService) {
      throw new NotFoundException(`VehicleService #${id} não encontrado`);
    }

    return vehicleService;
  }

  async update(id: number, updateVehicleServiceDto: UpdateVehicleServiceDto, manager?: EntityManager): Promise<VehicleService> {
    return this.transactional(async (manager) => {
      const vehicleService = await this.findOne(id);

      Object.assign(vehicleService, {
        name: updateVehicleServiceDto.name ?? vehicleService.name,
        description: updateVehicleServiceDto.description ?? vehicleService.description,
      });

      const vehicleServiceRepo = manager.getRepository(VehicleService);

      return vehicleServiceRepo.save(vehicleService);
    }, manager);
  }

  async remove(id: number, manager?: EntityManager): Promise<void> {
    return this.transactional(async (manager) => {
      const vehicleService = await this.findOne(id);

      const vehicleServiceRepo = manager.getRepository(VehicleService);
      await vehicleServiceRepo.softRemove(vehicleService);
    }, manager);
  }
}
