import { IsInt, IsOptional } from 'class-validator';

export class UpdatePurchaseOrderProposalDto {
  @IsOptional()
  @IsInt()
  vendor_id?: number;
}
