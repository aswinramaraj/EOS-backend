import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  qr_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  isbn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  edition?: string;

  @IsInt()
  @Min(1)
  category_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rack_id?: number;

  @IsInt()
  @Min(1)
  total_copies: number;

  /** Copies actually on the shelf right now — defaults to total_copies
   * (matches the design's "Copies on shelf" field being settable
   * independently of "Total copies" at creation time). */
  @IsOptional()
  @IsInt()
  @Min(0)
  available_copies?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_copy?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendor_fund?: string;
}
