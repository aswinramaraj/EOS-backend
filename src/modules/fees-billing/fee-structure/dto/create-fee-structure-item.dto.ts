import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFeeStructureItemDto {
  @IsInt()
  demand_category_id: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  concession_amount?: number;
}
