import { IsEnum, IsOptional } from 'class-validator';
import { BorrowStatus } from './search-borrow-records.dto';

export class GetMyBorrowedDto {
  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;
}
