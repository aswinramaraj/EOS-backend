import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { BorrowerType } from './create-borrow-record.dto';

export enum BorrowStatus {
  borrowed = 'borrowed',
  returned = 'returned',
  overdue = 'overdue',
  lost = 'lost',
  damaged = 'damaged',
}

export class SearchBorrowRecordsDto {
  @IsOptional()
  @IsEnum(BorrowerType)
  borrower_type?: BorrowerType;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  student_id?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  faculty_id?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  book_id?: number;

  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  overdue?: boolean = false;

  /** Filters returned/overdue records by whether their fine has been
   * collected yet — maps to the Overdue & fines screen's Unpaid/Collected
   * tabs (there is no "waived" tier; fines are only ever collected). */
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  fine_paid?: boolean;

  /** Filters lost/damaged records by whether the charge has been settled —
   * maps to the Lost & damaged books screen's settlement tabs. */
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  damage_lost_settled?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20;
}
