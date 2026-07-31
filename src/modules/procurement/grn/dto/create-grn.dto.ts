import { IsDateString, IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateGrnDto {
  @IsInt()
  purchase_order_id: number;

  @IsInt()
  quantity_received: number;

  @ValidateIf((dto) => dto.received_date !== undefined)
  @IsDateString()
  received_date?: string;

  @IsOptional()
  @IsInt()
  issued_to_venue_id?: number;

  @IsOptional()
  @IsDateString()
  issued_date?: string;

  @IsOptional()
  @IsInt()
  recorded_by_user_id?: number;
}
