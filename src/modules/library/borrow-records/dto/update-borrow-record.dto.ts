import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum BorrowRecordAction {
  return = 'return',
  renew = 'renew',
  damaged = 'damaged',
  lost = 'lost',
}

export class UpdateBorrowRecordDto {
  @IsEnum(BorrowRecordAction)
  action: BorrowRecordAction;

  @IsOptional()
  @IsDateString()
  return_date?: string;

  @IsOptional()
  @IsDateString()
  new_due_date?: string;
}
