import { Vehicle } from '../../../../administrative-management/vehicle/domain/entities/vehicle.entity';
import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn, JoinColumn } from 'typeorm';

@Entity()
export class Diagnosis {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({ name: 'vehicleId' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { nullable: false, eager: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ name: 'responsibleMechanicId' })
  responsibleMechanicId: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'responsibleMechanicId' })
  responsibleMechanic: User;

  @DeleteDateColumn()
  deletedAt: Date | null;
}