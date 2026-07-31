import { IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * PATCH /hr-payroll/:id (HR Payroll only).
 *
 * Intentionally NOT PartialType(CreateHrPayrollDto): `faculty_id` and `month`
 * identify WHICH payroll record this is and are not reassignable after
 * creation (same principle as every other module's identity fields).
 *
 * Because only gross_amount/net_amount persist (no breakdown columns), the
 * service requires ALL FIVE breakdown fields — basic_salary, hra, da,
 * pf_deduction, other_deductions — to be supplied together whenever any one
 * of them is being changed. Each field stays @IsOptional() here only because
 * a request that touches none of them (e.g. just `paid_on`) is valid; the
 * "all five together" rule is enforced in the service, not the DTO, since it
 * only applies once the breakdown is actually being recomputed. A partial
 * breakdown can never be merged with a prior update — nothing but the two
 * aggregates is stored, so an omitted field can't be distinguished from an
 * intentional zero.
 */
export class UpdateHrPayrollDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basic_salary?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hra?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  da?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pf_deduction?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  other_deductions?: number;

  @IsOptional()
  @IsISO8601({}, { message: 'paid_on must be a valid ISO date' })
  paid_on?: string;
}
