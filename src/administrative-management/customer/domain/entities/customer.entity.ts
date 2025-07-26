import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Customer {
  @ApiProperty({ description: 'ID único' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Nome' })
  @Column({ nullable: false })
  name: string;

  @ApiProperty({ description: 'CPF' })
  @Column({ nullable: false })
  cpf: string;

  @ApiProperty({ description: 'CNJP' })
  @Column({ nullable: true })
  cnpj: string;

  @ApiProperty({ description: 'Telefone' })
  @Column({ nullable: false })
  phone: string;

  @ApiProperty({ description: 'Email' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ description: 'Endereço' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Cidade' })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ description: 'Estado' })
  @Column({ nullable: true })
  state: string;

  @ApiProperty({ description: 'CEP' })
  @Column({ nullable: true })
  zipCode: string;

  @ApiProperty({ description: 'Data de criação' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;

  @ApiProperty({ description: 'Data de remoção' })
  @DeleteDateColumn()
  deletedAt: Date | null;
}
