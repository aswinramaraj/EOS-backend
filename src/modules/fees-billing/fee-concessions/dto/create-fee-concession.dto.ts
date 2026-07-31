import { IsNumber, Min } from 'class-validator';

export class CreateFeeConcessionDto {
  @IsNumber()
  @Min(0)
  concession_amount: number;
}
