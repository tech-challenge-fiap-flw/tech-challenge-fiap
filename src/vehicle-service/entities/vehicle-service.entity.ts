import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { VehicleServiceParts } from './vehicle-service-parts.entity';

@Entity()
export class VehicleService {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => VehicleServiceParts, (vsp) => vsp.service, { cascade: true, eager: true })
  vehicleServiceParts: VehicleServiceParts[];

  @DeleteDateColumn()
  deletedAt: Date | null;
}
