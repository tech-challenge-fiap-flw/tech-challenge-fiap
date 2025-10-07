import { Diagnosis } from "../../../diagnosis/domain/entities/diagnosis.entity";
import { BudgetVehiclePart } from "../../../budget-vehicle-part/domain/entities/budget-vehicle-part.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../../auth-and-access/user/domain/entities/user.entity";
import { BudgetVehicleServices } from "../../../budget-vehicle-services/domain/entities/budget-vehicle-services.entity";

@Entity()
export class Budget {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  description: string;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  creationDate: Date | null;

  @Column({ name: 'ownerId' })
  ownerId: number;

  @Column({ name: 'total', default: 0 })
  total: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ name: 'diagnosisId' })
  diagnosisId: number;

  @ManyToOne(() => Diagnosis, { nullable: false, eager: false })
  @JoinColumn({ name: 'diagnosisId' })
  diagnosis: Diagnosis;

  @OneToMany(() => BudgetVehiclePart, (part) => part.budget, { eager: false })
  vehicleParts: BudgetVehiclePart[];

  @OneToMany(() => BudgetVehicleServices, (bvs) => bvs.budget, { cascade: true })
  vehicleServices: BudgetVehicleServices[];
}
