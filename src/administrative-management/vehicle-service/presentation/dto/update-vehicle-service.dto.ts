import { PartialType } from '@nestjs/swagger';
import { CreateVehicleServiceDto } from './create-vehicle-service.dto';

export class UpdateVehicleServiceDto extends PartialType(CreateVehicleServiceDto) {}
