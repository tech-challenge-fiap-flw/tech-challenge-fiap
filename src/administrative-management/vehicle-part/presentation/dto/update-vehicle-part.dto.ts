import { PartialType } from '@nestjs/swagger';
import { CreateVehiclePartDto } from './create-vehicle-part.dto';

export class UpdateVehiclePartDto extends PartialType(CreateVehiclePartDto) {}
