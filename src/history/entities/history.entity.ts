import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;
  
  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}