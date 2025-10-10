import { NotFoundServerException } from "../../../shared/application/ServerException";
import { BudgetVehicleServiceEntity } from "../domain/BudgetVehicleServiceEntity";
import { IBudgetVehicleServiceMySqlRepository } from "../domain/IBudgetVehicleServiceMySqlRepository";

export type CreateBudgetVehicleServiceInput = {
  budgetId: number;
  vehicleServiceId: number;
  price?: number;
};

export type BudgetVehicleServiceOutput = Omit<ReturnType<BudgetVehicleServiceEntity['toJSON']>, 'password'>;

export interface IBudgetVehicleServiceService {
  create(input: CreateBudgetVehicleServiceInput): Promise<BudgetVehicleServiceOutput>;
  update(id: number, partial: Partial<CreateBudgetVehicleServiceInput>): Promise<BudgetVehicleServiceOutput>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<BudgetVehicleServiceOutput>;
}

export class BudgetVehicleServiceService implements IBudgetVehicleServiceService {
  constructor(private readonly repo: IBudgetVehicleServiceMySqlRepository) {}

  async create(input: CreateBudgetVehicleServiceInput): Promise<BudgetVehicleServiceOutput> {
    const entity = BudgetVehicleServiceEntity.create(input);

    const data = await this.repo.create(entity);

    return data.toJSON();
  }

  async update(id: number, partial: Partial<CreateBudgetVehicleServiceInput>): Promise<BudgetVehicleServiceOutput> {
    await this.findById(id);

    const updated = await this.repo.update(id, partial);

    if (!updated) {
      throw new NotFoundServerException('Budget Vehicle Service not found');
    }

    return updated.toJSON();
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<BudgetVehicleServiceOutput> {
    const user = await this.repo.findById(id);

    if (!user) {
      throw new NotFoundServerException('Budget Vehicle Service not found');
    }

    return user.toJSON();
  }
}
