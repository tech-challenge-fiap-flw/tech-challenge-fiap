import { VehiclePart } from "src/administrative-management/vehicle-part/domain/entities/vehicle-part.entity";
import { Budget } from "src/administrative-management/budget/domain/entities/budget.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BudgetVehiclePart {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'quantity', default: 0 })
  quantity: number;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  creationDate: Date | null;

  @Column({ name: 'budgetId' })
  budgetId: number;

  @ManyToOne(() => Budget, (budget) => budget.vehicleParts, { nullable: false, eager: false })
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;

  @Column({ name: 'vehiclePartId' })
  vehiclePartId: number;

  @ManyToOne(() => VehiclePart, { nullable: false, eager: false })
  vehiclePart: VehiclePart;
}
