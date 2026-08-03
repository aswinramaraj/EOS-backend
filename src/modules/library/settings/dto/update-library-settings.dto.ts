import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateLibrarySettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  books_per_student?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  default_borrowing_days?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_renewals?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  renewal_extension_days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fine_per_day?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lost_book_processing_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  damaged_book_charge_rate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  grace_period_days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  block_issue_above_fine?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  barcode_format?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  spine_label_prefix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  counter_opens_at?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  counter_closes_at?: string;
}
