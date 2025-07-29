import { Customer } from "../../../../administrative-management/customer/domain/entities/customer.entity";
import { Diagnosis } from "../../../../administrative-management/diagnosis/domain/entities/diagnosis.entity";
import { BudgetVehiclePart } from "../../../../administrative-management/budget-vehicle-part/domain/entities/budget-vehicle-part.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @ManyToOne(() => Customer, { nullable: false, eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: Customer;

  @Column({ name: 'diagnosisId' })
  diagnosisId: number;

  @ManyToOne(() => Diagnosis, { nullable: false, eager: false })
  @JoinColumn({ name: 'diagnosisId' })
  diagnosis: Diagnosis;

  @OneToMany(() => BudgetVehiclePart, (part) => part.budget, { cascade: true })
  vehicleParts: BudgetVehiclePart[];
}
