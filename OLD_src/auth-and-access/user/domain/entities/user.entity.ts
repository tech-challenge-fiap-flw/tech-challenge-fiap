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

  @ApiProperty({ description: 'CPF' })
  @Column({ nullable: false })
  cpf: string;

  @ApiProperty({ description: 'CNJP' })
  @Column({ nullable: true })
  cnpj: string;

  @ApiProperty({ description: 'Telefone' })
  @Column({ nullable: false })
  phone: string;

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
}
