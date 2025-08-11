import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Budget } from "../../administrative-management/budget/domain/entities/budget.entity";
import { User } from "../../auth-and-access/user/domain/entities/user.entity";
import { Vehicle } from "../../administrative-management/vehicle/domain/entities/vehicle.entity";
import { ServiceOrderStatus } from "../enum/service-order-status.enum";

@Entity()
export class ServiceOrder {
  @PrimaryGeneratedColumn('increment')
  idServiceOrder: number;  

  @Column()
  description: string; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @Column({type: 'enum', enum: ServiceOrderStatus,})
  currentStatus: string;

  @ManyToOne(() => Budget, { nullable: true, eager: false })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'mechanicId' })
  mechanic: User;

  @ManyToOne(() => Vehicle, { nullable: false, eager: false })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({type: 'boolean', default: true, nullable: false})
  active: boolean;
}
