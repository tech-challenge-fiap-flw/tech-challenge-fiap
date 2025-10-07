import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, In, Repository } from 'typeorm';
import { VehiclePart } from '../entities/vehicle-part.entity';
import { CreateVehiclePartDto } from '../../presentation/dto/create-vehicle-part.dto';
import { UpdateVehiclePartDto } from '../../presentation/dto/update-vehicle-part.dto';

@Injectable()
export class VehiclePartService {
  constructor(
    @InjectRepository(VehiclePart)
    private vehiclePartRepository: Repository<VehiclePart>
  ) {}

  async create(createDto: CreateVehiclePartDto): Promise<VehiclePart> {
    return this.vehiclePartRepository.save(createDto);
  }

  async findByNameLike(name: string): Promise<VehiclePart[]> {
    return this.vehiclePartRepository.find({
      where: {
        name: ILike(`%${name}%`),
      },
    });
  }

  async findOne(id: number): Promise<VehiclePart> {
    const customer = await this.vehiclePartRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException(`Vehicle Part with id ${id} not found`);
    }

    return customer;
  }

  async updatePart(vehiclePartId: number, updateVehiclePartDto: UpdateVehiclePartDto, manager?: EntityManager): Promise<VehiclePart> {
    const vehiclePartRepo = manager ? manager.getRepository(VehiclePart) : this.vehiclePartRepository;

    await vehiclePartRepo.update({ id: vehiclePartId }, updateVehiclePartDto);
    return vehiclePartRepo.findOne({ where: { id: vehiclePartId } });
  }

  findByIds(vehiclePartIds: number[]): Promise<VehiclePart[]> {
    return this.vehiclePartRepository.find({
      where: {
        id: In(vehiclePartIds),
      },
    });
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.vehiclePartRepository.softRemove(customer);
  }
}
