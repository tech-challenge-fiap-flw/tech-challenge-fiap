import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn, Column } from 'typeorm';
import { VehicleService } from 'src/vehicle-service/entities/vehicle-service.entity';
import { Budget } from 'src/administrative-management/budget/domain/entities/budget.entity';

@Entity()
export class BudgetVehicleServices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'budgetId' })
  budgetId: number;

  @ManyToOne(() => Budget, (budget) => budget.vehicleServices, { nullable: false, eager: false })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column({ name: 'vehicleServiceId' })
  vehicleServiceId: number;

  @ManyToOne(() => VehicleService, { eager: false })
  @JoinColumn({ name: 'vehicleServiceId' })
  vehicleService: VehicleService;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
