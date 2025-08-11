import { AssignBudgetDto } from '../../../presentation/dto/assign-budget.dto';
import { VehiclePartItemDto } from '../../../../budget/presentation/dto/vehicle-part-item.dto';

export const mockAssignBudget: AssignBudgetDto = {
  description: 'Troca de peças e serviços gerais',
  vehicleParts: [
    {
      id: 1,
      quantity: 2,
    } as VehiclePartItemDto,
    {
      id: 2,
      quantity: 1,
    } as VehiclePartItemDto,
  ],
  vehicleServicesIds: [101, 102, 103],
};
