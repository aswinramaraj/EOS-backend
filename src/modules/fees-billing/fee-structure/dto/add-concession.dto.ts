import { IsNumber, Min } from 'class-validator';

export class AddConcessionDto {
  @IsNumber()
  @Min(0)
  concession_amount: number;
}
