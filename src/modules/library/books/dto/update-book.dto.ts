import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  qr_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rack_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  total_copies?: number;

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
