import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * POST /salary-divisions (HR Payroll only).
 *
 * workflow.md: "salary divisions like HPA, PF and others are managed here."
 * salary_divisions is a per-faculty, per-component reference record — e.g.
 * one row for "HPA" effective from a given date, another for "PF" — distinct
 * from salary_payments, which holds the actual computed monthly gross/net
 * figures. This module manages the components themselves; it does not feed
 * them into HR Payroll's monthly computation, since that module's existing
 * basic_salary/hra/da/pf_deduction/other_deductions inputs are untouched.
 */
export class CreateSalaryDivisionDto {
  @IsInt()
  faculty_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  division_name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsISO8601({}, { message: 'effective_from must be a valid ISO date' })
  effective_from: string;
}
