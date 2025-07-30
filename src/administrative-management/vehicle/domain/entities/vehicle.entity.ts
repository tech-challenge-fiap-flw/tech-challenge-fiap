import { User } from '../../../../auth-and-access/user/domain/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  idPlate: string;

  @Column()
  type: string;

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column()
  manufactureYear: number;

  @Column()
  modelYear: number;

  @Column()
  color: string;

  @Column({ name: 'ownerId' })
  ownerId: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
