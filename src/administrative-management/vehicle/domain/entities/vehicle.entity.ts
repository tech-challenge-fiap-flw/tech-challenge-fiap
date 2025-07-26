import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../../customer/domain/entities/customer.entity';
import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vehicle {
  @ApiProperty({ description: 'ID único' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Placa' })
  @Column()
  id_plate: string;

  @ApiProperty({ description: 'Tipo' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Modelo' })
  @Column()
  model: string;

  @ApiProperty({ description: 'Marca' })
  @Column()
  brand: string;

  @ApiProperty({ description: 'Ano de fabricação' })
  @Column()
  manufacture_year: number;

  @ApiProperty({ description: 'Ano do modelo' })
  @Column()
  model_year: number;

  @ApiProperty({ description: 'Cor' })
  @Column()
  color: string;

  @ApiProperty({ description: 'Dono' })
  @ManyToOne(() => Customer, { nullable: false, eager: true })
  @JoinColumn({ name: 'owner_id' })
  owner: Customer;

  @ApiProperty({ description: 'Data de remoção' })
  @DeleteDateColumn()
  deletedAt: Date | null;
}
