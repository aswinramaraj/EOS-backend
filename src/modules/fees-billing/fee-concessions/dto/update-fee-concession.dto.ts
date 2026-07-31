import { IsNumber, Min } from 'class-validator';

export class UpdateFeeConcessionDto {
  @IsNumber()
  @Min(0)
  concession_amount: number;
}
