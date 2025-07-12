import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  description?: string;
}
