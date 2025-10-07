import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class VehiclePart {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  creationDate: Date | null;
}
