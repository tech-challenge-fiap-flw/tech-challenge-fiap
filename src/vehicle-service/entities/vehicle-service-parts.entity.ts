import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VehiclePart } from 'src/administrative-management/vehicle-part/domain/entities/vehicle-part.entity';
import { VehicleService } from './vehicle-service.entity';

@Entity('vehicle_service_parts')
export class VehicleServiceParts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => VehicleService, (service) => service.vehicleServiceParts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: VehicleService;

  @ManyToOne(() => VehiclePart, { eager: true })
  @JoinColumn({ name: 'partId' })
  part: VehiclePart;
}
