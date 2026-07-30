import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * POST /venues (Admin only).
 *
 * Matches the `venues` table exactly: name (required), location and
 * capacity (both optional). No department/owner column exists — venues
 * are institution-wide infrastructure records, not scoped to anyone.
 */
export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capacity?: number;
}
