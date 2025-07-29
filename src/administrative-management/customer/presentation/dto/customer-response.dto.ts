import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'ID único' })
  id: number;

  @ApiProperty({ description: 'Nome' })
  name: string;

  @ApiProperty({ description: 'CPF' })
  cpf: string;

  @ApiProperty({ description: 'CNJP' })
  cnpj: string;

  @ApiProperty({ description: 'Telefone' })
  phone: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Endereço' })
  address: string;

  @ApiProperty({ description: 'Cidade' })
  city: string;

  @ApiProperty({ description: 'Estado' })
  state: string;

  @ApiProperty({ description: 'CEP' })
  zipCode: string;

  @ApiProperty({ description: 'Data de criação' })
  creationDate: Date;

  @ApiProperty({ description: 'Data de remoção' })
  deletedAt: Date | null;
}