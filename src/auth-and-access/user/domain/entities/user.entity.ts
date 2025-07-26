import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ description: 'ID único' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Nome' })
  @Column({ nullable: false })
  name: string;

  @ApiProperty({ description: 'Email' })
  @Column({ unique: true, nullable: false })
  email: string;

  @Column()
  password: string;
  
  @Column()
  type: string;

  @Column({type: 'boolean', default: true, nullable: false})
  active: boolean;

  @ApiProperty({ description: 'Data de criação' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
  creationDate: Date;
}
