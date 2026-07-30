import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * PATCH /salary-divisions/:id (HR Payroll only).
 *
 * Intentionally NOT PartialType(CreateSalaryDivisionDto): `faculty_id`
 * identifies WHOSE division this is and is not reassignable after creation
 * (same principle as every other module's identity fields) — a division
 * mistakenly created for the wrong faculty should be deleted and recreated,
 * not reassigned.
 */
export class UpdateSalaryDivisionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  division_name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsISO8601({}, { message: 'effective_from must be a valid ISO date' })
  effective_from?: string;
}
