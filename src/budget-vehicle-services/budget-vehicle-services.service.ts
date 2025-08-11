import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/domain/services/base-service.service';
import { BudgetVehicleServices } from './entities/budget-vehicle-services.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CreateBudgetVehicleServiceDto } from './dto/create-budget-vehicle-service.dto';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BudgetVehicleServicesService extends BaseService<BudgetVehicleServices> {
  constructor(
    @InjectDataSource()
    dataSource: DataSource
  ) {
    super(dataSource, BudgetVehicleServices);
  }

  async create(dto: CreateBudgetVehicleServiceDto, manager?: EntityManager): Promise<BudgetVehicleServices[]> {
    return this.transactional(async (manager) => {
      const repo = this.getCurrentRepository(manager);

      const entities = dto.vehicleServices.map(vs =>
        repo.create({
          budgetId: dto.budgetId,
          vehicleServiceId: vs,
        })
      );

      return await repo.save(entities);
    }, manager);
  }
}
