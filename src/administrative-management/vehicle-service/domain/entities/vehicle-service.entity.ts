import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class VehicleService {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ default: 0 })
  price: number;

  @Column({ nullable: true })
  description: string;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
