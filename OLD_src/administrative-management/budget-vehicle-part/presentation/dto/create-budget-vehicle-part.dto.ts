import { VehiclePartItemDto } from "../../../budget/presentation/dto/vehicle-part-item.dto";

export class CreateBudgetVehiclePartDto {
  budgetId: number;
  vehicleParts: VehiclePartItemDto[];
}
