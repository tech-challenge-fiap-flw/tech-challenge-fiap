import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { CreateVehicleServiceDto } from './dto/create-vehicle-service.dto';
import { UpdateVehicleServiceDto } from './dto/update-vehicle-service.dto';
import { BaseService } from 'src/shared/domain/services/base-service.service';
import { VehiclePartService } from 'src/administrative-management/vehicle-part/domain/services/vehicle-part.service';
import { VehicleService } from './entities/vehicle-service.entity';
import { VehicleServiceParts } from './entities/vehicle-service-parts.entity';

@Injectable()
export class VehicleServiceService extends BaseService<VehicleService> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,

    private readonly vehiclePartService: VehiclePartService,
  ) {
    super(dataSource, VehicleService);
  }

  async create(createVehicleServiceDto: CreateVehicleServiceDto, manager?: EntityManager): Promise<VehicleService> {
    return this.transactional(async (manager) => {
      const { name, description, parts } = createVehicleServiceDto;

      const partsIds = parts.map(p => p.partId);
      const foundParts = await this.vehiclePartService.findByIds(partsIds);

      if (foundParts.length !== partsIds.length) {
        throw new NotFoundException('Uma ou mais peças não foram encontradas');
      }

      const vehicleServiceRepo = manager.getRepository(VehicleService);
      const vehicleServicePartsRepo = manager.getRepository(VehicleServiceParts);

      const vehicleService = vehicleServiceRepo.create({
        name,
        description,
        vehicleServiceParts: [],
      });

      await vehicleServiceRepo.save(vehicleService);

      const vehicleServiceParts = parts.map(({ partId, quantity }) => {
        const partEntity = foundParts.find(p => p.id === partId);
        return vehicleServicePartsRepo.create({
          quantity,
          part: partEntity,
          service: vehicleService,
        });
      });

      await vehicleServicePartsRepo.save(vehicleServiceParts);

      vehicleService.vehicleServiceParts = vehicleServiceParts;

      return vehicleService;
    }, manager);
  }

  async findByIds(ids: number[]): Promise<VehicleService[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.repository.find({
      where: { id: In(ids) },
      relations: ['vehicleServiceParts', 'vehicleServiceParts.part'],
    });
  }

  async findAll(): Promise<VehicleService[]> {
    return this.repository.find({ relations: ['vehicleServiceParts', 'vehicleServiceParts.part'] });
  }

  async findOne(id: number): Promise<VehicleService> {
    const vehicleService = await this.repository.findOne({
      where: { id },
      relations: ['vehicleServiceParts', 'vehicleServiceParts.part'],
    });

    if (!vehicleService) {
      throw new NotFoundException(`VehicleService #${id} não encontrado`);
    }

    return vehicleService;
  }

  async update(id: number, updateVehicleServiceDto: UpdateVehicleServiceDto, manager?: EntityManager): Promise<VehicleService> {
    return this.transactional(async (manager) => {
      const vehicleService = await this.findOne(id);

      if (updateVehicleServiceDto.parts) {
        const partsIds = updateVehicleServiceDto.parts.map(p => p.partId);
        const foundParts = await this.vehiclePartService.findByIds(partsIds);

        if (foundParts.length !== partsIds.length) {
          throw new NotFoundException('Uma ou mais peças não foram encontradas');
        }

        const vehicleServicePartsRepo = manager.getRepository(VehicleServiceParts);

        await vehicleServicePartsRepo.delete({ service: { id: vehicleService.id } });

        const newVehicleServiceParts = updateVehicleServiceDto.parts.map(({ partId, quantity }) => {
          const partEntity = foundParts.find(p => p.id === partId);
          return vehicleServicePartsRepo.create({
            quantity,
            part: partEntity,
            service: vehicleService,
          });
        });

        await vehicleServicePartsRepo.save(newVehicleServiceParts);

        vehicleService.vehicleServiceParts = newVehicleServiceParts;
      }

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
