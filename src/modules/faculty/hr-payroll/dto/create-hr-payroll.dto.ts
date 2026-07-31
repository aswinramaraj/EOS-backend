import {
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

/**
 * POST /hr-payroll (HR Payroll only).
 *
 * salary_payments has NO basic_salary/hra/da/pf_deduction/other_deductions
 * columns and NO payslip_url column — schema.prisma is the source of truth.
 * It stores only two aggregates: gross_amount and net_amount. This DTO
 * accepts the spec's breakdown fields purely as computation input:
 *   gross_amount = basic_salary + hra + da
 *   net_amount   = gross_amount - pf_deduction - other_deductions
 * Neither the breakdown nor `net_salary` is ever persisted or accepted as a
 * direct value — net_amount is always server-computed.
 *
 * `month` is a single "YYYY-MM" string here but is split into separate
 * month/year SmallInt columns for storage (that's how the schema models it).
 *
 * `payee_type` is always 'faculty' for this module — salary_payments also
 * serves non_teaching_staff, which is out of scope here.
 * `processed_by_user_id` is never client-supplied — derived from
 * @CurrentUser().sub, same pattern as every other module's audit fields.
 */
export class CreateHrPayrollDto {
  @IsInt()
  faculty_id: number;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in the format YYYY-MM',
  })
  month: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basic_salary: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hra: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  da: number;

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
