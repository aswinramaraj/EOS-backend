import { IsInt, IsOptional } from 'class-validator';

export class CreateServiceOrderProposalDto {
  @IsInt()
  indent_id: number;

  @IsOptional()
  @IsInt()
  vendor_id?: number;
}
