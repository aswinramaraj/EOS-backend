import { IsInt, IsOptional } from 'class-validator';

export class UpdateServiceOrderProposalDto {
  @IsOptional()
  @IsInt()
  vendor_id?: number;
}
