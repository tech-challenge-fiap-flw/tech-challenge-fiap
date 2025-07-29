import { VehiclePartItemDto } from "../../../../administrative-management/budget/presentation/dto/vehicle-part-item.dto";

export class CreateBudgetVehiclePartDto {
  budgetId: number;
  vehicleParts: VehiclePartItemDto[];
}
