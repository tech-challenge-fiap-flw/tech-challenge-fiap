import { PickType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';

export class UpdateBudgetDto extends PickType(CreateBudgetDto, ['description', 'vehicleParts', 'vehicleServicesIds'] as const) {}