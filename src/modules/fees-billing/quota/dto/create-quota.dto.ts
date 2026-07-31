import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateQuotaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
