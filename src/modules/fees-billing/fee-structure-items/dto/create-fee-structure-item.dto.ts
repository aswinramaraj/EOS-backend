import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateFeeStructureItemDto {
  @IsInt()
  demand_category_id: number;

  @IsNumber()
  @Min(0)
  amount: number;
}
