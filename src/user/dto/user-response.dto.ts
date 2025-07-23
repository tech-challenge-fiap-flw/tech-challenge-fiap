import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'bce55aef-07b2-4c61-bb8f-ecab8c6b8a9d' })
  id: string;

  @ApiProperty({ example: 'João da Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ example: 'admin', description: 'Tipo do usuário (ex: admin, cliente)' })
  type: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  creationDate: Date;
}
